import { Opponent, PlayerTeamMember, Pokemon } from "./pokemon.model";

export interface GameSession {
    sessionId: string;
    playerName: string;
    rentalPokemon: Pokemon[];
    playerTeam: PlayerTeamMember[];
    opponents: Opponent[];
    currentBattle?: {
        opponentIndex: number;
        playerActiveIndex: number;
        opponentActiveIndex: number;
        turn: number;
    };
    currentChallenge: number;
    battlesWon: number;
    pokemonSwapsAvailable: number;
    gameState: 'TEAM_SELECTION' | 'BATTLE' | 'SWAP_DECISION' | 'GAME_OVER';
    createdAt: Date;
    completedAt?: Date;
    isCompleted: boolean;
    result?: 'VICTORY' | 'DEFEAT' | 'CANCELLED';
    swapsMade?: any[];
}

export interface BattleTurnResult {
    turn: number;
    playerAction: {
        attacker: string;
        move: string;
        damage: number;
        effectiveness: string;
        opponentHpAfter: number;
        opponentFainted: boolean;
    };
    opponentAction?: {
        attacker: string;
        move: string;
        damage: number;
        effectiveness: string;
        playerHpAfter: number;
        playerFainted: boolean;
    };
    battleStatus: {
        playerActivePokemon: {
            name: string;
            currentHp: number;
            maxHp: number;
        };
        opponentActivePokemon: {
            name: string;
            currentHp: number;
            maxHp: number;
        };
        isBattleOver: boolean;
        winner?: 'player' | 'opponent';
        message?: string;
    };
}

export interface AttemptHistory {
    id: number;
    playerName: string;
    sessionId: string;
    result: 'VICTORY' | 'DEFEAT' | 'CANCELLED';
    battlesWon: number;
    teamUsed: Array<{ name: string; types: string[] }>;
    swapsMade: any[];
    totalTurns: number;
    completedAt: Date;
}