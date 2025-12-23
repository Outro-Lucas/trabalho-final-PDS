import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { GameSession, BattleTurnResult, AttemptHistory } from '../models/game.model';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private apiUrl = 'http://localhost:3000/api/game';
    private currentSessionId = new BehaviorSubject<string | null>(null);
    private currentSession = new BehaviorSubject<GameSession | null>(null);

    get currentSessionIdValue(): string | null {
        return this.currentSessionId.getValue();
    }

    currentSessionId$ = this.currentSessionId.asObservable();
    currentSession$ = this.currentSession.asObservable();

    constructor(private http: HttpClient) { }

    // Start a new game
    startGame(playerName: string): Observable<GameSession> {
        return this.http.post<GameSession>(`${this.apiUrl}/start`, { playerName });
    }

    // Select team
    selectTeam(sessionId: string, pokemonIds: number[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/${sessionId}/select-team`, { pokemonIds });
    }

    // Execute battle turn
    executeTurn(sessionId: string, moveIndex: number): Observable<BattleTurnResult> {
        return this.http.post<BattleTurnResult>(`${this.apiUrl}/${sessionId}/battle/turn`, { moveIndex });
    }

    // Swap Pokémon after victory
    swapPokemon(sessionId: string, playerPokemonId: number, opponentPokemonId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${sessionId}/swap`, { playerPokemonId, opponentPokemonId });
    }

    // Get game status
    getGameStatus(sessionId: string): Observable<GameSession> {
        return this.http.get<GameSession>(`${this.apiUrl}/${sessionId}/status`);
    }

    // Get player history
    getPlayerHistory(playerName: string): Observable<{ playerName: string, totalAttempts: number, victories: number, attempts: AttemptHistory[] }> {
        return this.http.get<any>(`${this.apiUrl}/history/${playerName}`);
    }

    // Set current session
    setCurrentSession(session: GameSession): void {
        this.currentSessionId.next(session.sessionId);
        this.currentSession.next(session);
    }

    // Clear current session
    clearCurrentSession(): void {
        this.currentSessionId.next(null);
        this.currentSession.next(null);
    }

    // Get type color utility
    getTypeColor(type: string): string {
        const typeColors: { [key: string]: string } = {
            normal: '#A8A878',
            fire: '#F08030',
            water: '#6890F0',
            electric: '#F8D030',
            grass: '#78C850',
            ice: '#98D8D8',
            fighting: '#C03028',
            poison: '#A040A0',
            ground: '#E0C068',
            flying: '#A890F0',
            psychic: '#F85888',
            bug: '#A8B820',
            rock: '#B8A038',
            ghost: '#705898',
            dragon: '#7038F8',
            dark: '#705848',
            steel: '#B8B8D0',
            fairy: '#EE99AC'
        };
        return typeColors[type.toLowerCase()] || '#68A090';
    }
}