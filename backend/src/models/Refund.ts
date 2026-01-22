import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Payment from './Payment';

export enum RefundStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed'
}

interface RefundAttributes {
  id: number;
  userId: number;
  paymentId: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  adminNotes?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefundCreationAttributes extends Optional<RefundAttributes, 'id' | 'status' | 'adminNotes' | 'processedAt' | 'createdAt' | 'updatedAt'> {}

class Refund extends Model<RefundAttributes, RefundCreationAttributes> implements RefundAttributes {
  public id!: number;
  public userId!: number;
  public paymentId!: number;
  public amount!: number;
  public reason!: string;
  public status!: RefundStatus;
  public adminNotes?: string;
  public processedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Refund.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RefundStatus)),
      defaultValue: RefundStatus.REQUESTED
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'refunds'
  }
);

export default Refund;

