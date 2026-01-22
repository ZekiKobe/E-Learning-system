import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment'
}

interface LessonAttributes {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LessonCreationAttributes extends Optional<LessonAttributes, 'id' | 'description' | 'content' | 'videoUrl' | 'duration' | 'isPreview' | 'createdAt' | 'updatedAt'> {}

class Lesson extends Model<LessonAttributes, LessonCreationAttributes> implements LessonAttributes {
  public id!: number;
  public courseId!: number;
  public title!: string;
  public description?: string;
  public type!: LessonType;
  public content?: string;
  public videoUrl?: string;
  public duration?: number;
  public order!: number;
  public isPreview!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lesson.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM(...Object.values(LessonType)),
      allowNull: false,
      defaultValue: LessonType.VIDEO
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isPreview: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'lessons'
  }
);

export default Lesson;

