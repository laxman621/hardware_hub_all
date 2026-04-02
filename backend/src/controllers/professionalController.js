import prisma from '../config/prisma.js';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

// ─────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────

// GET /api/professionals
// Public – returns only available professionals
export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await prisma.professional.findMany({
      where: {
        isAvailable: true,
        userId: { not: null }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { rating: 'desc' }
    });

    res.status(200).json({ success: true, count: professionals.length, professionals });
  } catch (error) {
    console.error('getAllProfessionals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/professionals/search?skill=&minRate=&maxRate=&minExp=&minRating=
// Public – filter professionals
export const searchProfessionals = async (req, res) => {
  try {
    const { skill, minRate, maxRate, minExp, minRating } = req.query;

    const where = {
      isAvailable: true,
      userId: { not: null }
    };

    if (skill) {
      where.skill = { contains: skill, mode: 'insensitive' };
    }

    if (minRate !== undefined || maxRate !== undefined) {
      where.hourlyRate = {};
      if (minRate !== undefined) where.hourlyRate.gte = parseFloat(minRate);
      if (maxRate !== undefined) where.hourlyRate.lte = parseFloat(maxRate);
    }

    if (minExp !== undefined) {
      where.experienceYears = { gte: parseInt(minExp) };
    }

    if (minRating !== undefined) {
      where.rating = { gte: parseFloat(minRating) };
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { rating: 'desc' }
    });

    res.status(200).json({ success: true, count: professionals.length, professionals });
  } catch (error) {
    console.error('searchProfessionals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/professionals/:id
// Public – single professional profile
export const getProfessionalById = async (req, res) => {
  try {
    const professionalId = parseNumber(req.params.id);

    if (!professionalId) {
      return res.status(400).json({ success: false, message: 'Invalid professional id' });
    }

    const professional = await prisma.professional.findUnique({
      where: { professionalId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    res.status(200).json({ success: true, professional });
  } catch (error) {
    console.error('getProfessionalById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// PROFESSIONAL (self)
// ─────────────────────────────────────────────

// GET /api/professionals/me
// Professional – view their own profile
export const getMyProfile = async (req, res) => {
  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional profile not found' });
    }

    res.status(200).json({ success: true, professional });
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/professionals/me
// Professional – update their own profile
export const updateMyProfile = async (req, res) => {
  try {
    const { skill, experienceYears, hourlyRate, bio } = req.body;

    const existing = await prisma.professional.findUnique({
      where: { userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Professional profile not found' });
    }

    const data = {};
    if (skill !== undefined) data.skill = skill;
    if (experienceYears !== undefined) {
      const parsed = parseNumber(experienceYears);
      if (parsed === null) return res.status(400).json({ success: false, message: 'Invalid experienceYears' });
      data.experienceYears = parsed;
    }
    if (hourlyRate !== undefined) {
      const parsed = parseNumber(hourlyRate);
      if (parsed === null) return res.status(400).json({ success: false, message: 'Invalid hourlyRate' });
      data.hourlyRate = parsed;
    }
    if (bio !== undefined) data.bio = bio;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully', professional: updated });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/professionals/me/availability
// Professional – toggle availability
export const updateMyAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isAvailable must be a boolean' });
    }

    const existing = await prisma.professional.findUnique({
      where: { userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Professional profile not found' });
    }

    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data: { isAvailable }
    });

    res.status(200).json({
      success: true,
      message: `Availability set to ${isAvailable}`,
      isAvailable: updated.isAvailable
    });
  } catch (error) {
    console.error('updateMyAvailability error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/professionals/me/bookings
// Professional – view their own bookings
export const getMyBookings = async (req, res) => {
  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: req.user.id },
      select: { professionalId: true }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional profile not found' });
    }

    const { status } = req.query;
    const where = { professionalId: professional.professionalId };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────

// GET /api/professionals/admin/all
// Admin – all professionals regardless of availability
export const adminGetAllProfessionals = async (req, res) => {
  try {
    const { isAvailable, skill } = req.query;
    const where = {};

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }
    if (skill) {
      where.skill = { contains: skill, mode: 'insensitive' };
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { professionalId: 'desc' }
    });

    res.status(200).json({ success: true, count: professionals.length, professionals });
  } catch (error) {
    console.error('adminGetAllProfessionals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/professionals/admin
// Admin – manually create a professional profile for an existing user
export const adminCreateProfessional = async (req, res) => {
  try {
    const { userId, skill, experienceYears, hourlyRate, bio, isAvailable } = req.body;

    if (!skill || !userId) {
      return res.status(400).json({ success: false, message: 'userId and skill are required' });
    }

    const parsedUserId = parseNumber(userId);
    if (!parsedUserId) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: { id: true, role: true, professional: { select: { professionalId: true } } }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.professional) {
      return res.status(409).json({ success: false, message: 'User already has a professional profile' });
    }

    // Create professional profile + update user role in a transaction
    const [professional] = await prisma.$transaction([
      prisma.professional.create({
        data: {
          userId: parsedUserId,
          skill,
          experienceYears: parseNumber(experienceYears),
          hourlyRate: parseNumber(hourlyRate),
          bio: bio || null,
          isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true
        }
      }),
      prisma.user.update({
        where: { id: parsedUserId },
        data: { role: 'professional' }
      })
    ]);

    res.status(201).json({ success: true, message: 'Professional profile created', professional });
  } catch (error) {
    console.error('adminCreateProfessional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/professionals/admin/:id
// Admin – update any professional profile
export const adminUpdateProfessional = async (req, res) => {
  try {
    const professionalId = parseNumber(req.params.id);

    if (!professionalId) {
      return res.status(400).json({ success: false, message: 'Invalid professional id' });
    }

    const { skill, experienceYears, hourlyRate, bio, isAvailable, rating } = req.body;

    const existing = await prisma.professional.findUnique({ where: { professionalId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    const data = {};
    if (skill !== undefined) data.skill = skill;
    if (bio !== undefined) data.bio = bio;
    if (typeof isAvailable === 'boolean') data.isAvailable = isAvailable;
    if (experienceYears !== undefined) {
      const parsed = parseNumber(experienceYears);
      if (parsed === null) return res.status(400).json({ success: false, message: 'Invalid experienceYears' });
      data.experienceYears = parsed;
    }
    if (hourlyRate !== undefined) {
      const parsed = parseNumber(hourlyRate);
      if (parsed === null) return res.status(400).json({ success: false, message: 'Invalid hourlyRate' });
      data.hourlyRate = parsed;
    }
    if (rating !== undefined) {
      const parsed = parseNumber(rating);
      if (parsed === null || parsed < 0 || parsed > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a number between 0 and 5' });
      }
      data.rating = parsed;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    const updated = await prisma.professional.update({
      where: { professionalId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    res.status(200).json({ success: true, message: 'Professional updated', professional: updated });
  } catch (error) {
    console.error('adminUpdateProfessional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/professionals/admin/:id
// Admin – delete a professional profile and revert user role
export const adminDeleteProfessional = async (req, res) => {
  try {
    const professionalId = parseNumber(req.params.id);

    if (!professionalId) {
      return res.status(400).json({ success: false, message: 'Invalid professional id' });
    }

    const existing = await prisma.professional.findUnique({
      where: { professionalId },
      select: { userId: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.professional.delete({ where: { professionalId } });

      // Revert role back to user if the professional had a linked user
      if (existing.userId) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { role: 'user' }
        });
      }
    });

    res.status(200).json({ success: true, message: 'Professional profile deleted and user role reverted' });
  } catch (error) {
    console.error('adminDeleteProfessional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};