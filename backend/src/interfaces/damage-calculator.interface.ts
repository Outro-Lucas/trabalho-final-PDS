export interface DamageCalculator {
    calculateDamage(
        attacker: any,
        defender: any,
        move: any,
        isCritical: boolean
    ): {
        damage: number;
        isCritical: boolean;
        effectiveness: number;
        message: string;
    };
}