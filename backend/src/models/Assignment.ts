import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Course from './Course';
import Lesson from './Lesson';

interface AssignmentAttributes {
  id: number;
  courseId: number;
  lessonId?: number;
  title: string;
  description: string;
  instructions?: string;
  maxScore: number;
  dueDate?: Date;
  allowLateSubmission: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id' | 'lessonId' | 'instructions' | 'dueDate' | 'allowLateSubmission' | 'createdAt' | 'updatedAt'> {}

class Assignment extends Model<AssignmentAttributes, AssignmentCreationAttributes> implements AssignmentAttributes {
  public id!: number;
  public courseId!: number;
  public lessonId?: number;
  public title!: string;
  public description!: string;
  public instructions?: string;
  public maxScore!: number;
  public dueDate?: Date;
  public allowLateSubmission!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Assignment.init(
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
      allowNull: false
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allowLateSubmission: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'assignments'
  }
);

export default Assignment;

