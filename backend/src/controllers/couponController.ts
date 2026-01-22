import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Coupon, { DiscountType } from '../models/Coupon';
import Course from '../models/Course';
import { Op } from 'sequelize';

// Create coupon (admin only)
export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, courseId, discountType, discountValue, maxUses, validFrom, validUntil } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Validate discount value
    if (discountType === DiscountType.PERCENTAGE && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ error: 'Percentage discount must be between 0 and 100' });
    }

    if (discountType === DiscountType.FIXED && discountValue < 0) {
      return res.status(400).json({ error: 'Fixed discount must be positive' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      courseId,
      discountType,
      discountValue,
      maxUses,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil)
    });

    res.status(201).json(coupon);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Validate coupon
export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, courseId } = req.body;

    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        [Op.or]: [
          { courseId: courseId || null },
          { courseId: null } // Site-wide coupon
        ],
        validFrom: { [Op.lte]: new Date() },
        validUntil: { [Op.gte]: new Date() }
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all coupons (admin)
export const getAllCoupons = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const coupons = await Coupon.findAll({
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update coupon (admin)
export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, maxUses, validFrom, validUntil } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (isActive !== undefined) coupon.isActive = isActive;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    await coupon.save();

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Increment coupon usage
export const useCoupon = async (couponId: number) => {
  const coupon = await Coupon.findByPk(couponId);
  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }
};

