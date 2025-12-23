import { PokeApiService } from '../../api/pokeapi.service';
import { PokemonFactory } from './pokemon-facoty-class';

export class ApiPokemonFactory extends PokemonFactory {
    constructor(private pokeApiService: PokeApiService) {
        super();
    }

    async createPokemon(pokedexId: number): Promise<any> {
        const pokemonData = await this.pokeApiService.getPokemonById(pokedexId);

        return {
            ...pokemonData,
            level: 30,
            currentHp: this.calculateHP(pokemonData.baseStats.hp, 30),
            maxHp: this.calculateHP(pokemonData.baseStats.hp, 30),
            isRental: true,
        };
    }

    private calculateHP(baseHP: number, level: number): number {
        return Math.floor(((2 * baseHP * level) / 100) + level + 10);
    }
}