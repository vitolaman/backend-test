// src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { EmailLog } from './log.entity';

@Entity()
@Index('date_index', ['date'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  date: string;

  @Column()
  timezone: string;

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => EmailLog, (emailLog) => emailLog.user)
  emailLogs: EmailLog[];
}
