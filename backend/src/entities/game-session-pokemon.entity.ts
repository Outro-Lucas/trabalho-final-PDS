import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { GameSession } from './game-session.entity';

@Entity()
export class GameSessionPokemon {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => GameSession, session => session.sessionId)
    session: GameSession;

    @Column()
    pokedexId: number;

    @Column()
    name: string;

    @Column('simple-array')
    types: string[];

    @Column('simple-json')
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };

    @Column('simple-json')
    moves: Array<{
        name: string;
        type: string;
        power: number;
        accuracy: number;
    }>;

    @Column({ default: 30 })
    level: number;

    @Column()
    isRental: boolean;

    @Column()
    belongsToPlayer: boolean;

    @Column({ nullable: true })
    battleIndex: number;
}