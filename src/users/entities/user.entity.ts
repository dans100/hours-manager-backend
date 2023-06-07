import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../types/user-role.enums';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: UserRole,
  })
  role: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column({
    nullable: true,
  })
  hashedPassword?: string;

  @Column({
    nullable: true,
  })
  resetPasswordToken?: string;

  @Column({
    nullable: true,
  })
  currentHashedToken?: string;

  @Column({
    nullable: true,
  })
  currentHashedRefreshToken?: string;
}
