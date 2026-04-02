import prisma from '../config/prisma.js';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const canReadBooking = (user, booking) => {
  if (!user || !booking) return false;
  if (user.role === 'admin') return true;
  if (user.id === booking.userId) return true;
  return booking.professional?.userId === user.id;
};

// GET /api/bookings
// Admin only
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        },
        payment: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canReadBooking(req.user, booking)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/user/:userId
export const getUserBookings = async (req, res) => {
  try {
    const userId = parseNumber(req.params.userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('getUserBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/bookings
// User booking request to hire a professional
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { professionalId, bookingDate, serviceHours, notes } = req.body;

    const parsedProfessionalId = parseNumber(professionalId);
    const parsedServiceHours = parseNumber(serviceHours);

    if (!parsedProfessionalId || !bookingDate || !parsedServiceHours || parsedServiceHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'professionalId, bookingDate and positive serviceHours are required'
      });
    }

    const professional = await prisma.professional.findUnique({
      where: { professionalId: parsedProfessionalId },
      include: { user: { select: { id: true } } }
    });

    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    if (!professional.userId) {
      return res.status(400).json({
        success: false,
        message: 'This professional profile is not linked to an account yet'
      });
    }

    if (!professional.isAvailable) {
      return res.status(400).json({ success: false, message: 'Professional is not available right now' });
    }

    const hourlyRate = Number(professional.hourlyRate || 0);
    const totalAmount = Number((hourlyRate * parsedServiceHours).toFixed(2));

    const created = await prisma.booking.create({
      data: {
        userId,
        professionalId: parsedProfessionalId,
        bookingDate: new Date(bookingDate),
        serviceHours: parsedServiceHours,
        totalAmount,
        notes: notes || null,
        status: 'pending'
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        professional: {
          include: { user: { select: { id: true, name: true, email: true, phone: true } } }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: created });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const existing = await prisma.booking.findUnique({ where: { bookingId } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && req.user.id !== existing.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (existing.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: { status: 'cancelled' }
    });

    res.status(200).json({ success: true, message: 'Booking cancelled', data: updated });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/bookings/:id/status
// Professional (owner) or admin can update status
export const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);
    const { status } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { professional: { select: { userId: true } } }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwnerProfessional = booking.professional?.userId === req.user.id;
    if (req.user.role !== 'admin' && !isOwnerProfessional) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await prisma.booking.update({
      where: { bookingId },
      data: { status }
    });

    res.status(200).json({ success: true, message: 'Booking status updated', data: updated });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/bookings/:id
// Admin, booking owner user, or owner professional can delete
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = parseNumber(req.params.id);

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { professional: { select: { userId: true } } }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isBookingOwner = req.user.id === booking.userId;
    const isOwnerProfessional = booking.professional?.userId === req.user.id;

    if (req.user.role !== 'admin' && !isBookingOwner && !isOwnerProfessional) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await prisma.booking.delete({ where: { bookingId } });

    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('deleteBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
