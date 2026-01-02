import { Component, effect, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
import { Session } from '../../models/session.interface';

@Component({
  imports: [],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  inSession = signal(false);
  nickname = signal('');
  error = signal<string | null>(null);
  loading = signal(false);
  difficulty = signal<number | null>(null);
  userId = signal<string | null>(null);
  sessionId = signal<string | null>(null);

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private router: Router
  ) {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      this.userId.set(savedUserId);
      this.inSession.set(true);
    }

    effect(() => {
      const id = this.userId();
      if (id) {
        localStorage.setItem('userId', id);
      } else {
        localStorage.removeItem('userId');
      }
    });
  }

  createUser(): void {
    this.error.set(null);
    this.loading.set(true);

    this.userService.create({ nickname: this.nickname() }).subscribe({
      next: (data: User) => {
        this.userId.set(data.id);
        this.inSession.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Já existe um usuário com esse nickname.');
        this.loading.set(false);
      }
    });
  }

  newSession(): void {
    this.error.set(null);

    this.sessionService.create({
      userId: this.userId()!,
      difficulty: this.difficulty()!,
    }).subscribe({
      next: (data: Session) => {
        localStorage.setItem('session', JSON.stringify(data));
        this.router.navigate(['/team']);
      },
      error: () => {
        this.error.set('Erro ao criar nova sessão.');
      }
    });
  }


}
