import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';

export enum PaymentProvider {
  CHAPA = 'chapa',
  TELEBIRR = 'telebirr'
}

export enum PaymentStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

interface PaymentAttributes {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  reference: string;
  status: PaymentStatus;
  metadata?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'metadata' | 'createdAt' | 'updatedAt'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public userId!: number;
  public courseId!: number;
  public amount!: number;
  public currency!: string;
  public provider!: PaymentProvider;
  public reference!: string;
  public status!: PaymentStatus;
  public metadata?: object | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ETB' },
    provider: { type: DataTypes.ENUM(...Object.values(PaymentProvider)), allowNull: false },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM(...Object.values(PaymentStatus)), allowNull: false, defaultValue: PaymentStatus.INITIATED },
    metadata: { type: DataTypes.JSON, allowNull: true }
  },
  {
    sequelize,
    tableName: 'payments'
  }
);

// Associations are defined in associations.ts to avoid circular dependencies

export default Payment;


