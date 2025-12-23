export abstract class PokemonFactory {
    abstract createPokemon(pokedexId: number): Promise<any>;

    async createRandomTeam(count: number): Promise<any[]> {
        const team = [];
        const usedIds = new Set();

        for (let i = 0; i < count; i++) {
            let pokemon;
            do {
                pokemon = await this.createPokemon(this.getRandomPokedexId());
            } while (usedIds.has(pokemon.pokedexId));

            usedIds.add(pokemon.pokedexId);
            team.push(pokemon);
        }

        return team;
    }

    protected getRandomPokedexId(): number {
        return Math.floor(Math.random() * 1010) + 1;
    }
}