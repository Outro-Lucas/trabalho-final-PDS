import { Component, OnInit, signal } from '@angular/core';
import { BattleService } from '../../services/battle.service';
import { Router } from '@angular/router';
import { SessionIdBody, SwapPokemon } from '../../models/battle.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-swap',
  imports: [CommonModule],
  templateUrl: './swap.html',
  styleUrl: './swap.css',
})
export class Swap implements OnInit {

  session = signal<any | null>(null);
  trading = signal(false);

  selectedEnemyIndex = signal<number | null>(null);
  selectedPlayerIndex = signal<number | null>(null);

  constructor(
    private battleService: BattleService,
    private router: Router,
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

    this.session.set(storedSession);
  }

  get player() {
    return this.session()?.team ?? [];
  }

  get enemy() {
    return this.session()?.cpuTeam ?? [];
  }

  isEnemySelected(index: number): boolean {
    return this.selectedEnemyIndex() === index;
  }

  toggleEnemy(index: number): void {
    this.selectedEnemyIndex.set(
      this.selectedEnemyIndex() === index ? null : index
    );
  }

  isPlayerSelected(index: number): boolean {
    return this.selectedPlayerIndex() === index;
  }

  togglePlayer(index: number): void {
    this.selectedPlayerIndex.set(
      this.selectedPlayerIndex() === index ? null : index
    );
  }

  confirmTrade(): void {
    if (this.selectedEnemyIndex() === null || this.selectedPlayerIndex() === null) {
      console.warn('Seleção incompleta');
      return;
    }

    console.log('Enemy index:', this.selectedEnemyIndex());
    console.log('Player index:', this.selectedPlayerIndex());

    const swapBody: SwapPokemon = {
      sessionId: this.session()?.id,
      loseIndex: this.selectedPlayerIndex()!,
      cpuIndex: this.selectedEnemyIndex()!,
    };

    this.battleService.swapPokemon(swapBody).subscribe({
      next: () => {
        this.refuseSwap();
      },
      error: (err) => console.error('Error next battle:', err)
    });

  }

  confirmSwap(): void {
    this.trading.set(true);
  }

  refuseSwap(): void {
    const body: SessionIdBody = { sessionId: this.session()?.id };

    this.battleService.next(body).subscribe({
      next: (session) => {
        localStorage.setItem('session', JSON.stringify(session));
        this.session.set(session);
        this.router.navigate(['/battle']);
      },
      error: (err) => console.error('Error next battle:', err)
    });
  }
}
