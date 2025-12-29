import axios from 'axios';

export class PokeApiAdapter {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  async getRandomPokemons(quantity: number): Promise<any[]> {
    const maxPokemonId = 151;

    const ids = new Set<number>();
    while (ids.size < quantity) {
      ids.add(Math.floor(Math.random() * maxPokemonId) + 1);
    }

    const pokemons = [];

    for (const id of ids) {
      const response = await axios.get(`${this.baseUrl}/pokemon/${id}`);
      const data = response.data;

      const damageMoves = data.moves
        .filter((m: any) => m.move.url)
        .slice(0, 20);

      const moves = [];
      for (const moveRef of damageMoves) {
        const moveData = await axios.get(moveRef.move.url);
        if (moveData.data.damage_class.name !== 'status') {
          moves.push({
            name: moveData.data.name,
            power: moveData.data.power ?? 40,
            type: moveData.data.type.name,
          });
        }
        if (moves.length === 4) break;
      }

      pokemons.push({
        name: data.name,
        hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
        attack: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
        defense: data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
        types: data.types.map((t: any) => t.type.name),
        moves,
      });
    }

    return pokemons;
  }
}
