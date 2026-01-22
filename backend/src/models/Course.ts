import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
// Import User and Category for type references (associations defined in associations.ts)
import User from './User';
import Category from './Category';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

interface CourseAttributes {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  instructorId: number;
  categoryId: number;
  status: CourseStatus;
  level: string;
  language: string;
  duration?: number;
  rating?: number;
  totalRatings?: number;
  totalStudents?: number;
  previewVideo?: string;
  whatYouWillLearn?: string; // JSON array
  requirements?: string; // JSON array
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CourseCreationAttributes
  extends Optional<
    CourseAttributes,
    | 'id'
    | 'shortDescription'
    | 'thumbnail'
    | 'status'
    | 'rating'
    | 'totalRatings'
    | 'totalStudents'
    | 'previewVideo'
    | 'whatYouWillLearn'
    | 'requirements'
    | 'isFeatured'
    | 'isTrending'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: number;
  public title!: string;
  public slug!: string;
  public description!: string;
  public shortDescription?: string;
  public thumbnail?: string;
  public price!: number;
  public instructorId!: number;
  public categoryId!: number;
  public status!: CourseStatus;
  public level!: string;
  public language!: string;
  public duration?: number;
  public rating?: number;
  public totalRatings?: number;
  public totalStudents?: number;
  public previewVideo?: string;
  public whatYouWillLearn?: string;
  public requirements?: string;
  public isFeatured?: boolean;
  public isTrending?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CourseStatus)),
      defaultValue: CourseStatus.DRAFT
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Beginner'
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'English'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total duration in minutes'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    totalRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    previewVideo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    whatYouWillLearn: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of learning objectives'
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of course requirements'
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isTrending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'courses'
  }
);

export default Course;

