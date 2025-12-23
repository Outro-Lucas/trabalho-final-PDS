export interface Pokemon {
    id: number;
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
    moves: Move[];
    sprite: string;
    currentHp?: number;
    maxHp?: number;
    isActive?: boolean;
}

export interface Move {
    name: string;
    type: string;
    power: number;
    accuracy: number;
    pp: number;
}

export interface PlayerTeamMember {
    pokemonId: number;
    currentHp: number;
    maxHp: number;
    name: string;
    types: string[];
}

export interface Opponent {
    trainerId: number;
    name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    pokemon: Pokemon[];
}