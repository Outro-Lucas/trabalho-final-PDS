import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class History {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'integer' })
  difficulty!: number;

  @Column({ type: 'integer' })
  battle!: number;

  @Column()
  sessionId!: string;

  @Column()
  result!: 'VICTORY' | 'DEFEAT' | 'CANCELLED';

  @CreateDateColumn()
  finishedAt!: Date;
}
