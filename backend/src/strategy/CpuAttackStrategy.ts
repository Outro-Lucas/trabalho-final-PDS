import { MoveDTO, PokemonDTO } from '../adapter/PokeApiAdapter';
import { DamageStrategy } from './DamageStrategy';

export class CpuAttackStrategy {

  private damageStrategy = new DamageStrategy();

  chooseMove(
    attacker: PokemonDTO,
    defender: PokemonDTO
  ): MoveDTO {
    const moves = attacker.moves;

    let bestMove: MoveDTO | null = null;
    let bestDamage = -1;

    for (const move of moves) {
      const damage = this.damageStrategy.calculateDamage(
        attacker,
        defender,
        move
      );

      if (damage > bestDamage) {
        bestDamage = damage;
        bestMove = move;
      }
    }

    if (!bestMove) {
      throw new Error('CPU não encontrou ataque válido');
    }

    return bestMove;
  }
}
