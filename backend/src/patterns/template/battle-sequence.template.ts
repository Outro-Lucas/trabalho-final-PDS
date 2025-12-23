import { BattleResult } from "src/interfaces/battle-result.interface";

export abstract class BattleSequence {
    async executeBattle(session: any): Promise<BattleResult> {
        this.initializeBattle(session);
        await this.setupBattleField(session);

        let turn = 1;
        while (!this.isBattleOver(session)) {
            await this.executeTurn(session, turn);
            this.updateBattleStatus(session);
            turn++;
        }

        return this.concludeBattle(session);
    }

    protected initializeBattle(session: any): void {
        console.log(`Batalha ${session.currentChallenge} iniciada!`);
    }

    protected abstract setupBattleField(session: any): Promise<void>;
    protected abstract executeTurn(session: any, turn: number): Promise<void>;
    protected abstract isBattleOver(session: any): boolean;
    protected abstract concludeBattle(session: any): BattleResult;

    protected updateBattleStatus(session: any): void {
        session.currentBattle.turn++;
        console.log(`Turno ${session.currentBattle.turn} atualizado`);
    }
}
