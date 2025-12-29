import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SessionStatus =
  | 'CREATED'
  | 'POKEMONS_READY'
  | 'READY'
  | 'FINISHED';

export type SessionResult = 'VICTORY' | 'DEFEAT' | 'CANCELLED';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'integer' })
  difficulty!: number;

  @Column({ type: 'integer', default: 1 })
  battle!: number;

  @Column({ type: 'text', nullable: true })
  status!: SessionStatus;

  @Column({ type: 'simple-json', nullable: true })
  availablePokemons!: any[] | null;

  @Column({ type: 'simple-json', nullable: true })
  team!: any[] | null;

  @Column({ type: 'text', nullable: true })
  result!: SessionResult | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
