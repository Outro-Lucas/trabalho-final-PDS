import { PokeApiAdapter, PokemonDTO } from '../adapter/PokeApiAdapter';

export class PokemonService {
  private adapter = new PokeApiAdapter();

  async getRandomPokemons(count: number): Promise<PokemonDTO[]> {
    const pokemons: PokemonDTO[] = [];

    while (pokemons.length < count) {
      const pokemon = await this.adapter.getRandomPokemon();
      pokemons.push(pokemon);
    }

    return pokemons;
  }
}
