import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartGameComponent } from './components/start-game/start-game.component';
import { TeamSelectionComponent } from './components/team-selection/team-selection.component';
import { BattleComponent } from './components/battle/battle.component';
import { SwapComponent } from './components/swap/swap.component';
import { HistoryComponent } from './components/history/history.component';
import { RouterOutlet } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    StartGameComponent,
    TeamSelectionComponent,
    BattleComponent,
    SwapComponent,
    HistoryComponent,
  ],
  imports: [
    RouterOutlet,
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
