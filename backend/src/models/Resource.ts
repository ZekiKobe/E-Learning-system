import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Course from './Course';
import Lesson from './Lesson';

export enum ResourceType {
  PDF = 'pdf',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  LINK = 'link',
  CODE = 'code',
  OTHER = 'other'
}

interface ResourceAttributes {
  id: number;
  courseId: number;
  lessonId?: number;
  title: string;
  description?: string;
  type: ResourceType;
  fileUrl?: string;
  externalUrl?: string;
  downloadCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResourceCreationAttributes extends Optional<ResourceAttributes, 'id' | 'lessonId' | 'description' | 'fileUrl' | 'externalUrl' | 'downloadCount' | 'createdAt' | 'updatedAt'> {}

class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> implements ResourceAttributes {
  public id!: number;
  public courseId!: number;
  public lessonId?: number;
  public title!: string;
  public description?: string;
  public type!: ResourceType;
  public fileUrl?: string;
  public externalUrl?: string;
  public downloadCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resource.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(ResourceType)),
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    externalUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'resources'
  }
);

export default Resource;

