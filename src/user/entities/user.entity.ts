import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Role } from '../types/userRole.type';
import { Provider } from '../types/passportProvider.type';
import { Booking } from 'src/booking/entities/booking.entity';
import { TransactionLog } from 'src/transaction-log/entities/transaction-log.entity';
import { RefreshToken } from 'src/refresh-token/entities/refresh-token.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  phoneNum: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  socialId: string;

  @Column({ type: 'enum', enum: Provider, default: Provider.LOCAL })
  provider: Provider;

  @Column({ type: 'int', default: 1000000 })
  points: number;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  booking: Booking[];

  @OneToMany(() => TransactionLog, (withdrawal) => withdrawal.sender)
  withdrawal: TransactionLog[];

  @OneToMany(() => TransactionLog, (deposit) => deposit.receiver)
  deposit: TransactionLog[];

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;
}
