import { DamageStrategy } from './DamageStrategy';

export class CpuAttackStrategy {

  private damageStrategy = new DamageStrategy();

  chooseMove(
    attacker: any,
    defender: any
  ): any {
    const moves = attacker.moves;

    let bestMove: any | null = null;
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
