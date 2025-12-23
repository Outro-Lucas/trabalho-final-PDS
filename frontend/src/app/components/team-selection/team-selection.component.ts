import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Pokemon } from '../../models/pokemon.model';
import { GameService } from '../../services/game.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-team-selection',
  templateUrl: './team-selection.component.html',
  styleUrl: './team-selection.component.css'
})
export class TeamSelectionComponent implements OnInit {

  public isLoading: boolean = false;
  session$ = this.gameService.currentSession$;
  selectedPokemon: Pokemon[] = [];
  selectedTypes: string[] = [];

  constructor(private gameService: GameService, private router: Router) { }

  ngOnInit() {
    // this.session$.subscribe(session => {
    //   if (!session || session.gameState !== 'TEAM_SELECTION') {
    //     this.router.navigate(['/start']);
    //   }
    // });

    this.session$.pipe(take(1)).subscribe(session => {
      if (!session || session.gameState !== 'TEAM_SELECTION') {
        this.router.navigate(['/start']);
      }
    });
  }

  togglePokemon(pokemon: Pokemon) {
    if (this.isSelected(pokemon)) {
      this.selectedPokemon = this.selectedPokemon.filter(p => p.id !== pokemon.id);
    } else if (this.selectedPokemon.length < 3) {
      this.selectedPokemon.push(pokemon);
    }
    this.updateSelectedTypes();
  }

  isSelected(pokemon: Pokemon): boolean {
    return this.selectedPokemon.some(p => p.id === pokemon.id);
  }

  updateSelectedTypes() {
    const allTypes = this.selectedPokemon.flatMap(p => p.types);
    this.selectedTypes = [...new Set(allTypes)];
  }

  getTypeColor(type: string): string {
    return this.gameService.getTypeColor(type);
  }

  getDefaultSprite(): string {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
  }

  confirmSelection() {
    if (this.selectedPokemon.length !== 3) {
      Swal.fire('Error', 'You must select exactly 3 Pokémon!', 'error');
      return;
    }

    const sessionId = this.gameService.currentSessionIdValue;
    if (!sessionId) {
      this.router.navigate(['/start']);
      return;
    }

    const pokemonIds = this.selectedPokemon.map(p => p.id);

    this.isLoading = true; // Adicione um loading state

    this.gameService.selectTeam(sessionId, pokemonIds).subscribe({
      next: (response) => {
        console.log('Team selected, loading full session...');

        this.gameService.getGameStatus(sessionId).subscribe({
          next: (fullSession) => {
            console.log('Full session loaded:', fullSession);
            this.gameService.setCurrentSession(fullSession);

            // Pequeno delay para garantir que tudo carregue
            setTimeout(() => {
              this.router.navigate(['/battle']);
            }, 500);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error loading full session:', error);
            Swal.fire('Error', 'Failed to load battle data', 'error');
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to select team: ' + error.message, 'error');
      }
    });
  }

  cancelGame() {
    Swal.fire({
      title: 'Cancel Game?',
      text: 'Are you sure you want to cancel? All progress will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.gameService.clearCurrentSession();
        this.router.navigate(['/start']);
      }
    });
  }
}