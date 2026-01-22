import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Course from './Course';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

interface CouponAttributes {
  id: number;
  code: string;
  courseId?: number; // null for site-wide coupon
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'courseId' | 'maxUses' | 'usedCount' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id!: number;
  public code!: string;
  public courseId?: number;
  public discountType!: DiscountType;
  public discountValue!: number;
  public maxUses?: number;
  public usedCount!: number;
  public validFrom!: Date;
  public validUntil!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    discountType: {
      type: DataTypes.ENUM(...Object.values(DiscountType)),
      allowNull: false
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'coupons'
  }
);

export default Coupon;

