import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Assignment from './Assignment';

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  RETURNED = 'returned'
}

interface SubmissionAttributes {
  id: number;
  userId: number;
  assignmentId: number;
  content: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
  submittedAt?: Date;
  gradedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 'id' | 'fileUrl' | 'score' | 'feedback' | 'status' | 'submittedAt' | 'gradedAt' | 'createdAt' | 'updatedAt'> {}

class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  public id!: number;
  public userId!: number;
  public assignmentId!: number;
  public content!: string;
  public fileUrl?: string;
  public score?: number;
  public feedback?: string;
  public status!: SubmissionStatus;
  public submittedAt?: Date;
  public gradedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Submission.init(
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
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    score: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SubmissionStatus)),
      defaultValue: SubmissionStatus.SUBMITTED
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    gradedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'submissions',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'assignmentId']
      }
    ]
  }
);

export default Submission;

