import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Quiz from './Quiz';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay'
}

interface QuestionAttributes {
  id: number;
  quizId: number;
  question: string;
  type: QuestionType;
  points: number;
  order: number;
  options?: string; // JSON array for multiple choice options
  correctAnswer?: string; // JSON for correct answer(s)
  explanation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id' | 'options' | 'correctAnswer' | 'explanation' | 'createdAt' | 'updatedAt'> {}

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: number;
  public quizId!: number;
  public question!: string;
  public type!: QuestionType;
  public points!: number;
  public order!: number;
  public options?: string;
  public correctAnswer?: string;
  public explanation?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quizzes',
        key: 'id'
      }
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(QuestionType)),
      allowNull: false,
      defaultValue: QuestionType.MULTIPLE_CHOICE
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of options for multiple choice questions'
    },
    correctAnswer: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Correct answer(s) - can be array for multiple correct answers'
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'questions'
  }
);

export default Question;

