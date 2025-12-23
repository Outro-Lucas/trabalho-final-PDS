import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AttemptHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    playerName: string;

    @Column()
    sessionId: string;

    @Column()
    result: 'VICTORY' | 'DEFEAT';

    @Column()
    battlesWon: number;

    @Column('simple-json')
    teamUsed: Array<{
        name: string;
        types: string[];
    }>;

    @Column('simple-json')
    swapsMade: Array<{
        oldPokemon: string;
        newPokemon: string;
        atBattle: number;
    }>;

    @Column()
    totalTurns: number;

    @CreateDateColumn()
    completedAt: Date;
}