import { Response } from 'express';
import Category from '../models/Category';

export const getPublicCategories = async (req: any, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

