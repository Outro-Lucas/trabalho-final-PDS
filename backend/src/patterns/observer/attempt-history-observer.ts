import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameObserver } from 'src/interfaces/game-observer.interface';
import { AttemptHistory } from 'src/entities/attempt-history.entity';

export class AttemptHistoryObserver implements GameObserver {
    constructor(
        @InjectRepository(AttemptHistory)
        private attemptHistoryRepository: Repository<AttemptHistory>,
    ) { }

    onBattleStart(session: any): void {
        console.log(`Batalha iniciada: ${session.playerName}, ${session.sessionId}`);
    }

    onTurnComplete(session: any, result: any): void {
        console.log(`Turno ${result.turn} completado`);
    }

    onPokemonFainted(pokemon: any, trainer: string): void {
        console.log(`${pokemon.name} do ${trainer} desmaiou!`);
    }

    onGamePhaseChange(oldPhase: string, newPhase: string): void {
        console.log(`Fase alterada: ${oldPhase} -> ${newPhase}`);
    }

    async onGameEnd(session: any, result: 'VICTORY' | 'DEFEAT'): Promise<void> {
        const history = new AttemptHistory();
        history.playerName = session.playerName;
        history.sessionId = session.sessionId;
        history.result = result;
        history.battlesWon = session.battlesWon;
        history.teamUsed = session.playerTeam.map((p: any) => ({
            name: p.name,
            types: p.types,
        }));
        history.swapsMade = session.swapsMade || [];
        history.totalTurns = session.currentBattle?.turn || 1;
        history.completedAt = new Date();

        await this.attemptHistoryRepository.save(history);
        console.log(`Histórico salvo para ${session.playerName}: ${result}`);
    }
}