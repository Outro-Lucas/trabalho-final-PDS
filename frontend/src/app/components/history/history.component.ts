import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  playerName: string = '';
  historyData: any = null;
  isLoading = true;
  winRate = 0;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.playerName = params['playerName'];
      this.loadHistory();
    });
  }

  loadHistory() {
    this.isLoading = true;

    this.gameService.getPlayerHistory(this.playerName).subscribe({
      next: (data) => {
        this.historyData = data;
        this.winRate = data.totalAttempts > 0
          ? Math.round((data.victories / data.totalAttempts) * 100)
          : 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.isLoading = false;
        // Pode adicionar um alerta de erro aqui se quiser
      }
    });
  }

  getTypeColor(type: string): string {
    return this.gameService.getTypeColor(type);
  }
}