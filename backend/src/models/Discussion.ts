import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';
import Lesson from './Lesson';

export enum DiscussionType {
  QUESTION = 'question',
  DISCUSSION = 'discussion',
  ANNOUNCEMENT = 'announcement'
}

interface DiscussionAttributes {
  id: number;
  userId: number;
  courseId: number;
  lessonId?: number;
  parentId?: number; // For replies
  type: DiscussionType;
  title: string;
  content: string;
  isPinned: boolean;
  isResolved: boolean;
  upvotes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DiscussionCreationAttributes extends Optional<DiscussionAttributes, 'id' | 'lessonId' | 'parentId' | 'isPinned' | 'isResolved' | 'upvotes' | 'createdAt' | 'updatedAt'> {}

class Discussion extends Model<DiscussionAttributes, DiscussionCreationAttributes> implements DiscussionAttributes {
  public id!: number;
  public userId!: number;
  public courseId!: number;
  public lessonId?: number;
  public parentId?: number;
  public type!: DiscussionType;
  public title!: string;
  public content!: string;
  public isPinned!: boolean;
  public isResolved!: boolean;
  public upvotes!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Discussion.init(
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'discussions',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(...Object.values(DiscussionType)),
      defaultValue: DiscussionType.QUESTION
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'discussions'
  }
);

export default Discussion;

