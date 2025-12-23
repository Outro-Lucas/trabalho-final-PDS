import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameSession } from '../../models/game.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css']
})
export class SwapComponent implements OnInit {
  session: GameSession | null = null;
  currentOpponent: any = null;
  selectedPlayerPokemon: number | null = null;
  selectedOpponentPokemon: number | null = null;

  constructor(private gameService: GameService, private router: Router) { }

  ngOnInit() {
    this.gameService.currentSession$.subscribe(session => {
      if (!session || session.gameState !== 'SWAP_DECISION') {
        this.router.navigate(['/start']);
        return;
      }

      this.session = session;
      this.currentOpponent = session.opponents[session.currentBattle?.opponentIndex || 0];
    });
  }

  selectPlayerPokemon(pokemonId: number) {
    this.selectedPlayerPokemon = pokemonId;
  }

  selectOpponentPokemon(pokemonIndex: number) {
    this.selectedOpponentPokemon = pokemonIndex;
  }

  canSwap(): boolean {
    return this.selectedPlayerPokemon !== null &&
      this.selectedOpponentPokemon !== null &&
      this.session?.pokemonSwapsAvailable !== undefined &&
      this.session.pokemonSwapsAvailable > 0;
  }

  getTypeColor(type: string): string {
    return this.gameService.getTypeColor(type);
  }

  getDefaultSprite(): string {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
  }

  getPokemonSprite(pokemonId: number): string {
    const pokemon = this.session?.rentalPokemon.find(p => p.id === pokemonId);
    return pokemon?.sprite || this.getDefaultSprite();
  }

  performSwap() {
    if (!this.canSwap() || !this.session) return;

    Swal.fire({
      title: 'Confirm Swap',
      text: `Swap your Pokémon for ${this.currentOpponent?.pokemon[this.selectedOpponentPokemon!].name}? This is permanent!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, swap!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.gameService.swapPokemon(
          this.session!.sessionId,
          this.selectedPlayerPokemon!,
          this.selectedOpponentPokemon!
        ).subscribe({
          next: (response) => {
            Swal.fire('Success!', 'Pokémon swapped!', 'success');
            this.gameService.getGameStatus(this.session!.sessionId).subscribe(session => {
              this.gameService.setCurrentSession(session);
              this.router.navigate(['/battle']);
            });
          },
          error: (error) => {
            Swal.fire('Error', 'Swap failed: ' + error.message, 'error');
          }
        });
      }
    });
  }
}