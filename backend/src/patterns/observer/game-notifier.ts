import { GameObserver } from "src/interfaces/game-observer.interface";

export class GameNotifier {
    private observers: GameObserver[] = [];

    attach(observer: GameObserver): void {
        this.observers.push(observer);
    }

    detach(observer: GameObserver): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyBattleStart(session: any): void {
        this.observers.forEach(observer => observer.onBattleStart(session));
    }

    notifyTurnComplete(session: any, result: any): void {
        this.observers.forEach(observer => observer.onTurnComplete(session, result));
    }

    notifyPokemonFainted(pokemon: any, trainer: string): void {
        this.observers.forEach(observer => observer.onPokemonFainted(pokemon, trainer));
    }

    notifyGamePhaseChange(oldPhase: string, newPhase: string): void {
        this.observers.forEach(observer => observer.onGamePhaseChange(oldPhase, newPhase));
    }

    notifyGameEnd(session: any, result: 'VICTORY' | 'DEFEAT' | 'CANCELLED'): void {
        this.observers.forEach(observer => observer.onGameEnd(session, result));
    }
}