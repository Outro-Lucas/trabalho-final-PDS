import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
import { BattleService } from '../../services/battle.service';
import { SessionIdBody } from '../../models/battle.interface';

@Component({
  selector: 'app-finish',
  imports: [CommonModule],
  templateUrl: './finish.html',
  styleUrl: './finish.css',
})
export class Finish implements OnInit {

  session = signal<any | null>(null);

  constructor(
    private sessionService: SessionService,
    private battleService: BattleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const sessionRaw = localStorage.getItem('session');

    if (!sessionRaw) {
      this.router.navigate(['/home']);
      return;
    }

    const storedSession = JSON.parse(sessionRaw);
    if (!storedSession?.id) {
      this.router.navigate(['/home']);
      return;
    }

    this.getSession(storedSession.id);
  }

  getSession(sessionId: string): void {
    this.sessionService.getOne(sessionId).subscribe({
      next: (session) => {
        localStorage.setItem('session', JSON.stringify(session));
        this.session.set(session);
      },
      error: (err) => console.error('Error fetching session:', err),
    });
  }

  get team() {
    return this.session()?.team ?? [];
  }

  newSession(): void {
    // const bodyId: SessionIdBody = { sessionId: this.session()?.id ?? '' };
    // this.battleService.finish(bodyId).subscribe({
    //   next: () => {
    //     localStorage.removeItem('session');
    //     this.router.navigate(['/']);
    //   },
    //   error: (err) => console.error('Error finalizing session:', err),
    // });
    localStorage.removeItem('session');
    this.router.navigate(['/']);
  }
}
