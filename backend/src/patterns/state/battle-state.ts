import { GameState } from "src/interfaces/game-state.interface";
import { GameOverState } from "./game-over-state";
import { SwapDecisionState } from "./swap-decision-state";

export class BattleState implements GameState {
    async handleAction(session: any, action: any): Promise<any> {
        if (action.type === 'ATTACK') {
            // Implementar lógica de batalha
            const battleResult = await this.executeBattleTurn(session, action);

            if (this.isBattleOver(session)) {
                if (this.playerWon(session)) {
                    return { victory: true, nextState: 'SWAP_DECISION' };
                } else {
                    return { victory: false, nextState: 'GAME_OVER' };
                }
            }

            return battleResult;
        }

        throw new Error('Ação inválida para este estado');
    }

    canProceed(session: any): boolean {
        return session.gameState === 'BATTLE';
    }

    getNextState(session: any): GameState {
        if (session.battlesWon >= 3) {
            return new GameOverState();
        } else if (session.pokemonSwapsAvailable > 0) {
            return new SwapDecisionState();
        }
        return new BattleState();
    }

    private async executeBattleTurn(session: any, action: any): Promise<any> {
        // Implementação simplificada da batalha
        return { turnCompleted: true };
    }

    private isBattleOver(session: any): boolean {
        return false; // Implementar lógica real
    }

    private playerWon(session: any): boolean {
        return true; // Implementar lógica real
    }
}
