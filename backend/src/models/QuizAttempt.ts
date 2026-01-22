import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Quiz from './Quiz';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

interface QuizAttemptAttributes {
  id: number;
  userId: number;
  quizId: number;
  score?: number;
  totalScore?: number;
  percentage?: number;
  passed: boolean;
  status: AttemptStatus;
  startedAt?: Date;
  completedAt?: Date;
  answers?: string; // JSON object mapping questionId to answer
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuizAttemptCreationAttributes extends Optional<QuizAttemptAttributes, 'id' | 'score' | 'totalScore' | 'percentage' | 'passed' | 'status' | 'startedAt' | 'completedAt' | 'answers' | 'createdAt' | 'updatedAt'> {}

class QuizAttempt extends Model<QuizAttemptAttributes, QuizAttemptCreationAttributes> implements QuizAttemptAttributes {
  public id!: number;
  public userId!: number;
  public quizId!: number;
  public score?: number;
  public totalScore?: number;
  public percentage?: number;
  public passed!: boolean;
  public status!: AttemptStatus;
  public startedAt?: Date;
  public completedAt?: Date;
  public answers?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QuizAttempt.init(
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
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    totalScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    passed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AttemptStatus)),
      defaultValue: AttemptStatus.IN_PROGRESS
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Student answers mapped by questionId'
    }
  },
  {
    sequelize,
    tableName: 'quiz_attempts'
  }
);

export default QuizAttempt;

