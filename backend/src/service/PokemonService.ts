import { PokeApiAdapter } from '../adapter/PokeApiAdapter';

export class PokemonService {
  private adapter = new PokeApiAdapter();

  async getRandomPokemons(count: number): Promise<any[]> {
    const pokemons: any[] = [];

    while (pokemons.length < count) {
      const pokemon = await this.adapter.getRandomPokemons(6);
      pokemons.push(pokemon);
    }

    return pokemons;
  }
}
