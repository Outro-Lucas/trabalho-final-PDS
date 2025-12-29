import { Router, Request, Response } from 'express';
import { PokemonService } from '../service/PokemonService';
import { BattleService } from '../service/BattleService';
import { PokemonDTO, MoveDTO } from '../adapter/PokeApiAdapter';

export class BattleController {
  public router: Router = Router();

  private pokemonService = new PokemonService();
  private battleService = new BattleService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/pokemon/random', this.getRandomPokemons.bind(this));
    this.router.post('/attack', this.playerAttack.bind(this));
    this.router.post('/cpu-attack', this.cpuAttack.bind(this));
  }

  private async getRandomPokemons(req: Request, res: Response): Promise<void> {
    const count = Number(req.query.count) || 6;
    const pokemons = await this.pokemonService.getRandomPokemons(count);

    res.json(pokemons);
  }

  private async playerAttack(req: Request, res: Response): Promise<void> {
    const { attacker, defender, move } = req.body as {
      attacker: PokemonDTO;
      defender: PokemonDTO;
      move: MoveDTO;
    };

    if (!attacker || !defender || !move) {
      res.status(400).json({ message: 'Dados incompletos para ataque' });
      return;
    }

    const damage = this.battleService.playerAttack(
      attacker,
      defender,
      move
    );

    res.json({ damage });
  }

  private async cpuAttack(req: Request, res: Response): Promise<void> {
    const { attacker, defender } = req.body as {
      attacker: PokemonDTO;
      defender: PokemonDTO;
    };

    if (!attacker || !defender) {
      res.status(400).json({ message: 'Dados incompletos para ataque da CPU' });
      return;
    }

    const result = this.battleService.cpuAttack(attacker, defender);
    res.json(result);
  }
}
