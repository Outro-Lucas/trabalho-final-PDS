import { PokemonDTO, MoveDTO } from '../adapter/PokeApiAdapter';
import { DamageStrategy } from '../strategy/DamageStrategy';
import { CpuAttackStrategy } from '../strategy/CpuAttackStrategy';

export class BattleService {

    private damageStrategy = new DamageStrategy();
    private cpuStrategy = new CpuAttackStrategy();

    playerAttack(
        attacker: PokemonDTO,
        defender: PokemonDTO,
        move: MoveDTO
    ): number {
        return this.damageStrategy.calculateDamage(
            attacker,
            defender,
            move
        );
    }

    cpuAttack(
        attacker: PokemonDTO,
        defender: PokemonDTO
    ): { move: MoveDTO; damage: number } {
        const move = this.cpuStrategy.chooseMove(attacker, defender);

        const damage = this.damageStrategy.calculateDamage(
            attacker,
            defender,
            move
        );

        return { move, damage };
    }

    isPokemonDefeated(hp: number): boolean {
        return hp <= 0;
    }
}
