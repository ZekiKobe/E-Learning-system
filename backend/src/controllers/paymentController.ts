import { Request, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import Payment, { PaymentProvider, PaymentStatus } from '../models/Payment';
import Enrollment from '../models/Enrollment';
import User from '../models/User';

const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY || '';
const CHAPA_BASE = process.env.CHAPA_BASE_URL || 'https://api.chapa.co';

// Telebirr placeholders (varies by integration method)
const TELEBIRR_APP_KEY = process.env.TELEBIRR_APP_KEY || '';

export const createCheckout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { courseId, provider } = req.body as { courseId: number; provider: PaymentProvider };

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const reference = `ELS-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const amount = Number(course.price || 0);
    const currency = 'ETB';

    const payment = await Payment.create({
      userId: req.user.id,
      courseId: course.id,
      amount,
      currency,
      provider,
      reference,
      status: PaymentStatus.INITIATED
    });

    if (provider === PaymentProvider.CHAPA) {
      if (!CHAPA_SECRET) {
        return res.status(400).json({ error: 'Chapa is not configured. Set CHAPA_SECRET_KEY in environment.' });
      }
      const callback_url = `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/payments/chapa/verify/${reference}`;
      const return_url = `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:5174'}/learn/${course.id}`;
      const payload = {
        amount: amount.toString(),
        currency,
        email: req.user.email || 'user@example.com',
        first_name: req.user.firstName || 'User',
        last_name: req.user.lastName || 'User',
        tx_ref: reference,
        callback_url,
        return_url,
        title: course.title
      };

      try {
        const resp = await axios.post(`${CHAPA_BASE}/v1/transaction/initialize`, payload, {
          headers: { Authorization: `Bearer ${CHAPA_SECRET}` }
        });
        const checkoutUrl = resp.data?.data?.checkout_url;
        await payment.update({ status: PaymentStatus.PENDING, metadata: resp.data });
        return res.json({ checkoutUrl, reference });
      } catch (e: any) {
        await payment.update({ status: PaymentStatus.FAILED, metadata: e?.response?.data || { error: e?.message } });
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to initialize Chapa payment';
        return res.status(500).json({ error: msg });
      }
    }

    if (provider === PaymentProvider.TELEBIRR) {
      // TODO: Implement Telebirr initiation; placeholder response
      const placeholderUrl = `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:5174'}/payments/telebirr/${reference}`;
      await payment.update({ status: PaymentStatus.PENDING });
      return res.json({ checkoutUrl: placeholderUrl, reference });
    }

    return res.status(400).json({ error: 'Unsupported provider' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const chapaVerify = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params as { reference: string };
    const verifyResp = await axios.get(`${CHAPA_BASE}/v1/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${CHAPA_SECRET}` }
    });
    const status = verifyResp.data?.data?.status;

    const payment = await Payment.findOne({ where: { reference } });
    if (!payment) return res.status(404).send('payment not found');

    if (status === 'success') {
      await payment.update({ status: PaymentStatus.SUCCESS, metadata: verifyResp.data });
      // Enroll user
      const exists = await Enrollment.findOne({ where: { userId: payment.userId, courseId: payment.courseId } });
      if (!exists) {
        await Enrollment.create({ userId: payment.userId, courseId: payment.courseId, progress: 0, completed: false });
      }
      return res.json({ ok: true });
    } else {
      await payment.update({ status: PaymentStatus.FAILED, metadata: verifyResp.data });
      return res.status(400).json({ ok: false });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const telebirrNotify = async (req: Request, res: Response) => {
  // TODO: Validate Telebirr signature and payload, then mark payment success and enroll
  try {
    const { reference, status } = req.body || {};
    const payment = await Payment.findOne({ where: { reference } });
    if (!payment) return res.status(404).send('payment not found');
    if (status === 'SUCCESS') {
      await payment.update({ status: PaymentStatus.SUCCESS, metadata: req.body });
      const exists = await Enrollment.findOne({ where: { userId: payment.userId, courseId: payment.courseId } });
      if (!exists) {
        await Enrollment.create({ userId: payment.userId, courseId: payment.courseId, progress: 0, completed: false });
      }
    } else {
      await payment.update({ status: PaymentStatus.FAILED, metadata: req.body });
    }
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: list all payments with basic filters
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, provider } = req.query as {
      status?: PaymentStatus;
      provider?: PaymentProvider;
    };

    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Course,
          as: 'paymentCourse',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(payments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};


