import {
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { User } from '../../users/entities/user.entity';

@Table({ underscored: true })
export class File extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true, allowNull: false })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.TEXT, allowNull: false })
  key: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  url: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isSigned: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  expiryTime: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
