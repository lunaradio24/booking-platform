import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionType } from '../types/transaction-type.type';
import { User } from 'src/user/entities/user.entity';

@Entity({ name: 'transaction_logs' })
export class TransactionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_id', type: 'int', nullable: false })
  senderId: number;

  @Column({ name: 'receiver_id', type: 'int', nullable: false })
  receiverId: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'int' })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (sender) => sender.withdrawal)
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;

  @ManyToOne(() => User, (receiver) => receiver.deposit)
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
  receiver: User;
}
