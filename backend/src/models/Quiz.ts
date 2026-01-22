import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Course from './Course';

interface QuizAttributes {
  id: number;
  courseId: number;
  lessonId?: number;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuizCreationAttributes extends Optional<QuizAttributes, 'id' | 'lessonId' | 'description' | 'timeLimit' | 'maxAttempts' | 'createdAt' | 'updatedAt'> {}

class Quiz extends Model<QuizAttributes, QuizCreationAttributes> implements QuizAttributes {
  public id!: number;
  public courseId!: number;
  public lessonId?: number;
  public title!: string;
  public description?: string;
  public passingScore!: number;
  public timeLimit?: number;
  public maxAttempts?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Quiz.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passingScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 70,
      validate: {
        min: 0,
        max: 100
      }
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time limit in minutes'
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of attempts allowed'
    }
  },
  {
    sequelize,
    tableName: 'quizzes'
  }
);

export default Quiz;

