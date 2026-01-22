import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Lesson from './Lesson';

interface LessonProgressAttributes {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  watchTime: number; // in seconds
  lastPosition?: number; // last watched position in seconds
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LessonProgressCreationAttributes extends Optional<LessonProgressAttributes, 'id' | 'completed' | 'watchTime' | 'lastPosition' | 'completedAt' | 'createdAt' | 'updatedAt'> {}

class LessonProgress extends Model<LessonProgressAttributes, LessonProgressCreationAttributes> implements LessonProgressAttributes {
  public id!: number;
  public userId!: number;
  public lessonId!: number;
  public completed!: boolean;
  public watchTime!: number;
  public lastPosition?: number;
  public completedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LessonProgress.init(
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
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id'
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    watchTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total watch time in seconds'
    },
    lastPosition: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Last watched position in seconds'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'lesson_progress',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lessonId']
      }
    ]
  }
);

export default LessonProgress;

