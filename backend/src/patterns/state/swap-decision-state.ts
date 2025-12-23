import { GameState } from "src/interfaces/game-state.interface";
import { BattleState } from "./battle-state";

export class SwapDecisionState implements GameState {
  async handleAction(session: any, action: any): Promise<any> {
    if (action.type === 'SWAP_POKEMON') {
      // Implementar lógica de troca
      session.pokemonSwapsAvailable--;
      session.gameState = 'BATTLE';
      return { swapped: true, nextState: 'BATTLE' };
    }
    
    throw new Error('Ação inválida para este estado');
  }

  canProceed(session: any): boolean {
    return session.pokemonSwapsAvailable > 0;
  }

  getNextState(session: any): GameState {
    return new BattleState();
  }
}