import prisma from '../config/prisma.js';

// GET /api/hardware
export const getAllHardware = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, available } = req.query;

    const where = {};

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (available === 'true') where.isAvailable = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const data = await prisma.hardware.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Get hardware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/hardware/:id
export const getHardwareById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid hardware ID' });
    }

    const data = await prisma.hardware.findUnique({
      where: { hardwareId: id },
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'Hardware not found' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get hardware by id error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/hardware (admin)
export const createHardware = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      rentalPricePerDay,
      stockQuantity,
      imageUrl,
      isAvailable,
    } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const data = await prisma.hardware.create({
      data: {
        name,
        category: category || null,
        description: description || null,
        price: parseFloat(price),
        rentalPricePerDay: rentalPricePerDay != null && rentalPricePerDay !== '' ? parseFloat(rentalPricePerDay) : null,
        stockQuantity: stockQuantity != null && stockQuantity !== '' ? parseInt(stockQuantity, 10) : 0,
        imageUrl: imageUrl || null,
        isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
      },
    });

    return res.status(201).json({ success: true, message: 'Hardware created', data });
  } catch (error) {
    console.error('Create hardware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/hardware/:id (admin)
export const updateHardware = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid hardware ID' });
    }

    const updateData = { ...req.body };

    if (updateData.price != null && updateData.price !== '') updateData.price = parseFloat(updateData.price);
    if (updateData.rentalPricePerDay != null && updateData.rentalPricePerDay !== '') {
      updateData.rentalPricePerDay = parseFloat(updateData.rentalPricePerDay);
    }
    if (updateData.stockQuantity != null && updateData.stockQuantity !== '') {
      updateData.stockQuantity = parseInt(updateData.stockQuantity, 10);
    }

    const data = await prisma.hardware.update({
      where: { hardwareId: id },
      data: updateData,
    });

    return res.status(200).json({ success: true, message: 'Hardware updated', data });
  } catch (error) {
    console.error('Update hardware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/hardware/:id (admin)
export const deleteHardware = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid hardware ID' });
    }

    await prisma.hardware.delete({ where: { hardwareId: id } });

    return res.status(200).json({ success: true, message: 'Hardware deleted' });
  } catch (error) {
    console.error('Delete hardware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
