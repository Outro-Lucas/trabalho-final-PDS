import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-start-game',
  templateUrl: './start-game.component.html',
  styleUrl: './start-game.component.css'
})
export class StartGameComponent {
  public playerName = '';
  isLoading = false;

  constructor(private gameService: GameService, private router: Router) { }

  startGame() {
    if (!this.playerName.trim()) {
      Swal.fire('Error', 'Please enter your trainer name!', 'error');
      return;
    }

    this.isLoading = true;

    this.gameService.startGame(this.playerName).subscribe({
      next: (session) => {
        this.gameService.setCurrentSession(session);
        this.router.navigate(['/team-selection']);
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to start game: ' + error.message, 'error');
      }
    });
  }
}