export class DamageStrategy {

  calculateDamage(
    attacker: any,
    defender: any,
    move: any
  ): number {
    const baseDamage =
      ((attacker.attack / defender.defense) * move.power) / 2;

    const typeMultiplier = this.getTypeMultiplier(
      move.type,
      defender.types
    );

    const damage = Math.floor(baseDamage * typeMultiplier);

    return damage < 1 ? 1 : damage;
  }

  private getTypeMultiplier(
    attackType: string,
    defenderTypes: string[]
  ): number {
    let multiplier = 1;

    for (const type of defenderTypes) {
      if (this.isSuperEffective(attackType, type)) {
        multiplier *= 2;
      } else if (this.isNotVeryEffective(attackType, type)) {
        multiplier *= 0.5;
      }
    }

    return multiplier;
  }

  private isSuperEffective(attack: string, defense: string): boolean {
    const table: Record<string, string[]> = {
      fire: ['grass'],
      water: ['fire'],
      grass: ['water'],
      electric: ['water']
    };

    return table[attack]?.includes(defense) ?? false;
  }

  private isNotVeryEffective(attack: string, defense: string): boolean {
    const table: Record<string, string[]> = {
      fire: ['water'],
      water: ['grass'],
      grass: ['fire'],
      electric: ['grass']
    };

    return table[attack]?.includes(defense) ?? false;
  }
}
