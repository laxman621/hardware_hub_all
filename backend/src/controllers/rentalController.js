import prisma from '../config/prisma.js';

// POST /api/rentals
export const createRental = async (req, res) => {
  try {
    const { hardwareId, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!hardwareId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hardwareId, startDate, and endDate',
      });
    }

    const hardware = await prisma.hardware.findUnique({
      where: { hardwareId: parseInt(hardwareId, 10) },
    });

    if (!hardware) {
      return res.status(404).json({ success: false, message: 'Hardware not found' });
    }

    if (!hardware.isAvailable || Number(hardware.stockQuantity || 0) <= 0) {
      return res.status(400).json({ success: false, message: 'Hardware is not available for rent' });
    }

    if (!hardware.rentalPricePerDay) {
      return res.status(400).json({ success: false, message: 'This hardware is not available for rental' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid startDate or endDate' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = Number(hardware.rentalPricePerDay) * days;

    const rental = await prisma.rental.create({
      data: {
        userId,
        hardwareId: parseInt(hardwareId, 10),
        startDate: start,
        endDate: end,
        totalAmount,
        status: 'active',
      },
      include: {
        hardware: {
          select: {
            hardwareId: true,
            name: true,
            category: true,
            rentalPricePerDay: true,
            imageUrl: true,
          },
        },
      },
    });

    await prisma.hardware.update({
      where: { hardwareId: parseInt(hardwareId, 10) },
      data: {
        stockQuantity: Number(hardware.stockQuantity || 0) - 1,
        isAvailable: Number(hardware.stockQuantity || 0) - 1 > 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: rental,
    });
  } catch (error) {
    console.error('Create rental error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating rental' });
  }
};

// GET /api/rentals/user/:userId
export const getUserRentals = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const data = await prisma.rental.findMany({
      where: { userId },
      include: {
        hardware: {
          select: {
            hardwareId: true,
            name: true,
            category: true,
            rentalPricePerDay: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Get user rentals error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/rentals/:id
export const getRentalById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid rental ID' });
    }

    const data = await prisma.rental.findUnique({
      where: { rentalId: id },
      include: {
        hardware: true,
      },
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (data.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get rental by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/rentals/:id/return
export const returnRental = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid rental ID' });
    }

    const rental = await prisma.rental.findUnique({
      where: { rentalId: id },
      include: { hardware: true },
    });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (rental.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Rental is already returned' });
    }

    const updated = await prisma.rental.update({
      where: { rentalId: id },
      data: {
        status: 'returned',
        returnDate: new Date(),
      },
      include: {
        hardware: {
          select: {
            hardwareId: true,
            name: true,
            category: true,
            rentalPricePerDay: true,
            imageUrl: true,
          },
        },
      },
    });

    await prisma.hardware.update({
      where: { hardwareId: rental.hardwareId },
      data: {
        stockQuantity: Number(rental.hardware.stockQuantity || 0) + 1,
        isAvailable: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Rental returned successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Return rental error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/rentals (admin)
export const getAllRentals = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) where.status = status;

    const data = await prisma.rental.findMany({
      where,
      include: {
        hardware: {
          select: {
            hardwareId: true,
            name: true,
            category: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Get all rentals error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/rentals/:id/status (admin)
export const updateRentalStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid rental ID' });
    }

    const allowed = ['pending', 'active', 'returned', 'completed', 'cancelled', 'overdue'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const rental = await prisma.rental.findUnique({
      where: { rentalId: id },
      include: { hardware: true },
    });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const data = await prisma.rental.update({
      where: { rentalId: id },
      data: {
        status,
        returnDate: status === 'returned' ? new Date() : rental.returnDate,
      },
    });

    // Keep stock aligned when admin marks as returned.
    if (status === 'returned' && rental.status !== 'returned') {
      await prisma.hardware.update({
        where: { hardwareId: rental.hardwareId },
        data: {
          stockQuantity: Number(rental.hardware.stockQuantity || 0) + 1,
          isAvailable: true,
        },
      });
    }

    return res.status(200).json({ success: true, message: 'Rental status updated', data });
  } catch (error) {
    console.error('Update rental status error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
