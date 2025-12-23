import { GameState } from "src/interfaces/game-state.interface";

export class GameOverState implements GameState {
    async handleAction(session: any, action: any): Promise<any> {
        // Estado final, não há ações
        return { gameOver: true };
    }

    canProceed(session: any): boolean {
        return false;
    }

    getNextState(session: any): GameState {
        return this; // Permanece no mesmo estado
    }
}