import { GameState } from "src/interfaces/game-state.interface";
import { BattleState } from "./battle-state";

export class TeamSelectionState implements GameState {
    async handleAction(session: any, action: any): Promise<any> {
        if (action.type === 'SELECT_TEAM') {
            if (action.pokemonIds.length !== 3) {
                throw new Error('Selecione exatamente 3 Pokémon');
            }

            session.playerTeam = action.pokemonIds.map((id: number) => {
                const pokemon = session.rentalPokemon.find((p: any) => p.id === id);
                return {
                    pokemonId: id,
                    currentHp: pokemon.baseStats.hp * 2 + 110, // HP calculado
                    maxHp: pokemon.baseStats.hp * 2 + 110,
                };
            });

            session.gameState = 'BATTLE';
            session.currentBattle = {
                opponentIndex: 0,
                playerActiveIndex: 0,
                opponentActiveIndex: 0,
                turn: 1,
            };

            return { success: true, nextState: 'BATTLE' };
        }

        throw new Error('Ação inválida para este estado');
    }

    canProceed(session: any): boolean {
        return session.playerTeam && session.playerTeam.length === 3;
    }

    getNextState(session: any): GameState {
        return new BattleState();
    }
}