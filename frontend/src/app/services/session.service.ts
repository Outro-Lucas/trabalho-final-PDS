import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewSession, Session } from '../models/session.interface';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/sessions';

  getOne(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${id}`);
  }

  getPokemons(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${id}/pokemons`);
  }

  create(session: NewSession): Observable<Session> {
    return this.http.post<Session>(this.baseUrl, session);
  }

  selectedTeam(id: string, team: any): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/${id}/team`, team);
  }
}
