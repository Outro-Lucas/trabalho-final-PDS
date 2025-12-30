import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

export type BattleStatus = 'READY' | 'IN_BATTLE' | 'FINISHED'
export type BattleTurn = 'PLAYER' | 'CPU';
export type BattleResult = 'VICTORY' | 'DEFEAT' | null;

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'int' })
  difficulty!: number;

  @Column({ type: 'int' })
  battle!: number;

  @Column({ type: 'varchar', default: 'READY' })
  status!: BattleStatus;

  @Column({ type: 'varchar', nullable: true })
  turn!: BattleTurn | null;

  @Column({ type: 'simple-json', nullable: true })
  team!: any[] | null;

  @Column({ type: 'simple-json', nullable: true })
  cpuTeam!: any[] | null;

  @Column({ type: 'int', default: 0 })
  playerIndex!: number;

  @Column({ type: 'int', default: 0 })
  cpuIndex!: number;

  @Column({ type: 'varchar', nullable: true })
  result!: BattleResult;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
