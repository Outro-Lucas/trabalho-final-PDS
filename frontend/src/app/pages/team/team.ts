import { Component, OnInit, signal } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-team',
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class Team implements OnInit {

  pokemons = signal<any[]>([]);
  selectedIndexes = signal<number[]>([]);
  sessionId = '';

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const sessionRaw = localStorage.getItem('session');

    if (!sessionRaw) {
      this.router.navigate(['/home']);
      return;
    }

    const session = JSON.parse(sessionRaw);

    if (!session?.id) {
      this.router.navigate(['/home']);
      return;
    }

    this.sessionId = session.id;

    this.getPokemons(this.sessionId);
  }

  getPokemons(sessionId: string): void {
    this.sessionService.getPokemons(sessionId).subscribe({
      next: (data: any) => {
        this.pokemons.set(data as any[]);
      },
      error: () => {
        console.warn('Erro ao obter pokémons.');
      }
    });
  }

  togglePokemon(index: number): void {
    const current = this.selectedIndexes();

    if (current.includes(index)) {
      this.selectedIndexes.set(
        current.filter(i => i !== index)
      );
      return;
    }

    if (current.length >= 3) {
      return;
    }

    this.selectedIndexes.set([...current, index]);
  }

  isSelected(index: number): boolean {
    return this.selectedIndexes().includes(index);
  }

  confirmTeam(): void {
    if (this.selectedIndexes().length !== 3) {
      return;
    }

    const team = this.selectedIndexes().map(
      index => this.pokemons()[index]
    );

    this.sessionService.selectedTeam(this.sessionId, { team }).subscribe({
      next: () => {
        this.router.navigate(['/battle']);
      },
      error: () => {
        console.warn('Erro ao selecionar time.');
      }
    });
  }

}
