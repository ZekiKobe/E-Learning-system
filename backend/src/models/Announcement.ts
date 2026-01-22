import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Course from './Course';

interface AnnouncementAttributes {
  id: number;
  courseId: number;
  instructorId: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnnouncementCreationAttributes extends Optional<AnnouncementAttributes, 'id' | 'isPinned' | 'createdAt' | 'updatedAt'> {}

class Announcement extends Model<AnnouncementAttributes, AnnouncementCreationAttributes> implements AnnouncementAttributes {
  public id!: number;
  public courseId!: number;
  public instructorId!: number;
  public title!: string;
  public content!: string;
  public isPinned!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Announcement.init(
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
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    }
  },
  {
    sequelize,
    tableName: 'announcements'
  }
);

export default Announcement;

