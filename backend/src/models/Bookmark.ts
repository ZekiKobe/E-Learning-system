import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Lesson from './Lesson';

interface BookmarkAttributes {
  id: number;
  userId: number;
  lessonId: number;
  timestamp?: number; // Video timestamp in seconds
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookmarkCreationAttributes extends Optional<BookmarkAttributes, 'id' | 'timestamp' | 'note' | 'createdAt' | 'updatedAt'> {}

class Bookmark extends Model<BookmarkAttributes, BookmarkCreationAttributes> implements BookmarkAttributes {
  public id!: number;
  public userId!: number;
  public lessonId!: number;
  public timestamp?: number;
  public note?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bookmark.init(
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
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Video timestamp in seconds'
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'bookmarks',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'lessonId', 'timestamp']
      }
    ]
  }
);

export default Bookmark;

