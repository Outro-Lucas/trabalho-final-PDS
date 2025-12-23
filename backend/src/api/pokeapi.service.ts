import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokeApiService {
    private readonly baseUrl = 'https://pokeapi.co/api/v2';
    private totalPokemonCount = 1010; // Atualizado para Gen 8+

    async getRandomPokemon(count: number = 6): Promise<any[]> {
        try {
            const pokemonList = [];

            for (let i = 0; i < count; i++) {
                // Gerar ID aleatório entre 1 e totalPokemonCount
                const randomId = Math.floor(Math.random() * this.totalPokemonCount) + 1;
                const pokemonData = await this.getPokemonById(randomId);
                pokemonList.push(pokemonData);
            }

            return pokemonList;
        } catch (error) {
            throw new HttpException(
                'Erro ao buscar Pokémon da PokeAPI',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    async getPokemonById(id: number): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/pokemon/${id}`);
            const speciesResponse = await axios.get(response.data.species.url);

            // Filtrar apenas movimentos com dano (excluir status moves)
            const damageMoves = response.data.moves
                .filter((move: any) => {
                    const moveData = move.move;
                    return moveData.name.includes('tackle') ||
                        moveData.name.includes('punch') ||
                        moveData.name.includes('slash') ||
                        moveData.name.includes('blast') ||
                        moveData.name.includes('beam');
                })
                .slice(0, 12); // Pegar mais opções para randomizar

            // Selecionar 4 movimentos aleatórios
            const selectedMoves = this.selectRandomMoves(damageMoves);
            const movesWithDetails = await this.getMoveDetails(selectedMoves);

            return {
                id: response.data.id,
                name: response.data.name,
                types: response.data.types.map((t: any) => t.type.name),
                baseStats: {
                    hp: response.data.stats[0].base_stat,
                    attack: response.data.stats[1].base_stat,
                    defense: response.data.stats[2].base_stat,
                    specialAttack: response.data.stats[3].base_stat,
                    specialDefense: response.data.stats[4].base_stat,
                    speed: response.data.stats[5].base_stat,
                },
                moves: movesWithDetails,
                sprite: response.data.sprites.front_default,
            };
        } catch (error) {
            // Fallback para Pokémon genérico se a API falhar
            return this.getFallbackPokemon(id);
        }
    }

    private async getMoveDetails(moves: any[]): Promise<any[]> {
        const moveDetails = [];

        for (const move of moves.slice(0, 4)) {
            try {
                const response = await axios.get(move.move.url);
                moveDetails.push({
                    name: response.data.name,
                    type: response.data.type.name,
                    power: response.data.power || 40, // Default se não tiver
                    accuracy: response.data.accuracy || 100,
                    pp: response.data.pp || 15,
                });
            } catch {
                // Move genérico se falhar
                moveDetails.push({
                    name: 'Tackle',
                    type: 'normal',
                    power: 40,
                    accuracy: 100,
                    pp: 35,
                });
            }
        }

        return moveDetails;
    }

    private selectRandomMoves(moves: any[]): any[] {
        if (moves.length <= 4) return moves;

        const shuffled = [...moves].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }

    private getFallbackPokemon(id: number): any {
        const fallbackPokemon = [
            { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] },
            { id: 4, name: 'charmander', types: ['fire'] },
            { id: 7, name: 'squirtle', types: ['water'] },
            { id: 25, name: 'pikachu', types: ['electric'] },
            { id: 133, name: 'eevee', types: ['normal'] },
            { id: 448, name: 'lucario', types: ['fighting', 'steel'] },
        ];

        const pokemon = fallbackPokemon.find(p => p.id === id) || fallbackPokemon[0];

        return {
            id: pokemon.id,
            name: pokemon.name,
            types: pokemon.types,
            baseStats: {
                hp: 50,
                attack: 55,
                defense: 50,
                specialAttack: 45,
                specialDefense: 55,
                speed: 45,
            },
            moves: [
                { name: 'Tackle', type: 'normal', power: 40, accuracy: 100, pp: 35 },
                { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, pp: 30 },
                { name: 'Body Slam', type: 'normal', power: 85, accuracy: 100, pp: 15 },
                { name: 'Hyper Beam', type: 'normal', power: 150, accuracy: 90, pp: 5 },
            ],
            sprite: null,
        };
    }

    async generateOpponents(count: number = 3): Promise<any[]> {
        const opponents = [];
        const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const trainerNames = ['Ash', 'Misty', 'Brock', 'Gary', 'May', 'Dawn', 'Serena'];

        for (let i = 0; i < count; i++) {
            const pokemonTeam = await this.getRandomPokemon(3);

            opponents.push({
                trainerId: i + 1,
                name: trainerNames[Math.floor(Math.random() * trainerNames.length)],
                difficulty: difficulties[i],
                pokemon: pokemonTeam.map(p => ({
                    ...p,
                    currentHp: this.calculateHP(p.baseStats.hp, 30),
                    maxHp: this.calculateHP(p.baseStats.hp, 30),
                })),
            });
        }

        return opponents;
    }

    private calculateHP(baseHP: number, level: number): number {
        return Math.floor(((2 * baseHP * level) / 100) + level + 10);
    }
}