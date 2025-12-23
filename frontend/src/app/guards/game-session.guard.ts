import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GameSessionGuard {
    constructor(private gameService: GameService, private router: Router) { }

    canActivate() {
        return this.gameService.currentSessionId$.pipe(
            take(1), // Pegar apenas o primeiro valor
            map(sessionId => {
                console.log('Guard checking session ID:', sessionId);

                if (!sessionId) {
                    console.log('No session ID, redirecting to start');
                    this.router.navigate(['/start']);
                    return false;
                }

                console.log('Session ID found, allowing access');
                return true;
            })
        );
    }
}