import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

interface InstructorRequestAttributes {
  id: number;
  userId: number;
  message?: string;
  status: RequestStatus;
  reviewedBy?: number;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InstructorRequestCreationAttributes extends Optional<InstructorRequestAttributes, 'id' | 'message' | 'status' | 'reviewedBy' | 'reviewedAt' | 'rejectionReason' | 'createdAt' | 'updatedAt'> {}

class InstructorRequest extends Model<InstructorRequestAttributes, InstructorRequestCreationAttributes> implements InstructorRequestAttributes {
  public id!: number;
  public userId!: number;
  public message?: string;
  public status!: RequestStatus;
  public reviewedBy?: number;
  public reviewedAt?: Date;
  public rejectionReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InstructorRequest.init(
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
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      defaultValue: RequestStatus.PENDING
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'instructor_requests'
  }
);

export default InstructorRequest;

