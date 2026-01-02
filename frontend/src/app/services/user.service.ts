import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreated } from '../models/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/users';

  // getAll(): Observable<User[]> {
  //   return this.http.get<User[]>(this.baseUrl);
  // }

  create(user: UserCreated): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }
}
