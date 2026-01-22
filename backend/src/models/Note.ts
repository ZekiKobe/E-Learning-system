import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Lesson from './Lesson';

interface NoteAttributes {
  id: number;
  userId: number;
  lessonId: number;
  content: string;
  timestamp?: number; // Video timestamp in seconds
  createdAt?: Date;
  updatedAt?: Date;
}

interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'> {}

class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  public id!: number;
  public userId!: number;
  public lessonId!: number;
  public content!: string;
  public timestamp?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Note.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Video timestamp in seconds where note was taken'
    }
  },
  {
    sequelize,
    tableName: 'notes'
  }
);

export default Note;

