import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  currentSession$ = this.gameService.currentSession$;

  constructor(private gameService: GameService) { }

  ngOnInit() { }
}