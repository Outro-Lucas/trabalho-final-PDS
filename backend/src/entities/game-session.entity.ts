import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class GameSession {
    @PrimaryGeneratedColumn('uuid')
    sessionId: string;

    @Column()
    playerName: string;

    @Column('simple-json')
    rentalPokemon: Array<{
        id: number;
        pokedexId: number;
        name: string;
        types: string[];
        baseStats: {
            hp: number;
            attack: number;
            defense: number;
            specialAttack: number;
            specialDefense: number;
            speed: number;
        };
        moves: Array<{
            name: string;
            type: string;
            power: number;
            accuracy: number;
        }>;
    }>;

    @Column('simple-json')
    playerTeam: Array<{
        pokemonId: number;
        currentHp: number;
        maxHp: number;
        // ADICIONE ESTES CAMPOS PARA TER O NOME DO POKÉMON
        name?: string;
        types?: string[];
    }>;

    @Column('simple-json')
    opponents: Array<{
        trainerId: number;
        name: string;
        difficulty: 'easy' | 'medium' | 'hard';
        pokemon: Array<{
            pokedexId: number;
            name: string;
            types: string[];
            baseStats: any;
            moves: any[];
            currentHp: number;
            maxHp: number;
        }>;
    }>;

    @Column('simple-json')
    currentBattle: {
        opponentIndex: number;
        playerActiveIndex: number;
        opponentActiveIndex: number;
        turn: number;
    };

    @Column()
    currentChallenge: number;

    @Column()
    battlesWon: number;

    @Column()
    pokemonSwapsAvailable: number;

    @Column()
    gameState: 'TEAM_SELECTION' | 'BATTLE' | 'SWAP_DECISION' | 'GAME_OVER';

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ nullable: true })
    result: 'VICTORY' | 'DEFEAT';

    @Column('simple-json', { nullable: true, default: '[]' })
    swapsMade: Array<{
        oldPokemon: string;
        newPokemon: string;
        atBattle: number;
    }>;
}