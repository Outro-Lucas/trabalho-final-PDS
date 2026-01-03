import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewSession, Session } from '../models/session.interface';
import { PlayerAttack, SessionIdBody, SwapPokemon } from '../models/battle.interface';

@Injectable({ providedIn: 'root' })
export class BattleService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/battle';

  getBattle(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${id}`);
  }

  start(session: SessionIdBody): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/start`, session);
  }

  attack(body: PlayerAttack): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/attack`, body);
  }

  cpuAttack(session: SessionIdBody): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/cpu-attack`, session);
  }

  swapPokemon(swap: SwapPokemon): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/reward`, swap);
  }

  next(session: SessionIdBody): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/next`, session);
  }

  finish(session: SessionIdBody): Observable<Session> {
    return this.http.patch<Session>(`${this.baseUrl}/finish`, session);
  }

}
