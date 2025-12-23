export interface GameObserver {
    onBattleStart(session: any): void;
    onTurnComplete(session: any, result: any): void;
    onPokemonFainted(pokemon: any, trainer: string): void;
    onGamePhaseChange(oldPhase: string, newPhase: string): void;
    onGameEnd(session: any, result: 'VICTORY' | 'DEFEAT' | 'CANCELLED'): void;
}