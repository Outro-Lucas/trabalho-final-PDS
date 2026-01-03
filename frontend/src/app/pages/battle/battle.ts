import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { BattleService } from '../../services/battle.service';
import { PlayerAttack, SessionIdBody } from '../../models/battle.interface';

@Component({
  selector: 'app-battle',
  imports: [CommonModule],
  templateUrl: './battle.html',
  styleUrl: './battle.css',
})
export class Battle implements OnInit {

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
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  // GETTERS SEGUROS

  get player() {
    const s = this.session();
    if (!s) return null;
    return s.team[s.playerIndex];
  }

  get enemy() {
    const s = this.session();
    if (!s) return null;
    return s.cpuTeam[s.cpuIndex];
  }

  get playerHpPercent() {
    if (!this.player) return 0;
    return (this.player.currentHp / this.player.hp) * 100;
  }

  get enemyHpPercent() {
    if (!this.enemy) return 0;
    return (this.enemy.currentHp / this.enemy.hp) * 100;
  }

  // Battle
  startBattle(): void {
    const body: SessionIdBody = { sessionId: this.session()?.id };

    this.battleService.start(body).subscribe({
      next: (session) => {
        localStorage.setItem('session', JSON.stringify(session));
        this.session.set(session);
      },
      error: (err) => {
        console.error('Error fetching session:', err);
      }
    });
  }

  onSelectMove(index: number): void {
    console.log('Move selecionado:', index);
    const body: PlayerAttack = { sessionId: this.session()?.id, moveIndex: index };

    this.battleService.attack(body).subscribe({
      next: (session) => {
        localStorage.setItem('session', JSON.stringify(session));
        this.session.set(session);

        if (session.status === 'FINISHED') {

          // eh a terceira batalha e terminou
          if (session.battle === 3) {
            this.router.navigate(['/finish']);
            return;
          }

          alert(`Batalha finalizada! Resultado: ${session.result}`);
          this.router.navigate(['/swap']);
        } else {
          this.cpuTurn();
        }

      },
      error: (err) => {
        console.error('Error user turn:', err);
      }
    });
  }

  cpuTurn(): void {
    const body: SessionIdBody = { sessionId: this.session()?.id };
    this.battleService.cpuAttack(body).subscribe({
      next: (session) => {
        localStorage.setItem('session', JSON.stringify(session));
        this.session.set(session);
        if (session.status === 'FINISHED') {

          // eh a terceira batalha e terminou
          if (session.battle === 3) {
            this.router.navigate(['/finish']);
            return;
          }

          alert(`Batalha finalizada! Resultado: ${session.result}`);
          this.router.navigate(['/swap']);
        } else {
          console.log('Vez do jogador');
        }
      },
      error: (err) => {
        console.error('Error cpu turn:', err);
      }
    });
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
