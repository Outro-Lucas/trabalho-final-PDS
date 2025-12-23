import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartGameComponent } from './components/start-game/start-game.component';
import { TeamSelectionComponent } from './components/team-selection/team-selection.component';
import { BattleComponent } from './components/battle/battle.component';
import { SwapComponent } from './components/swap/swap.component';
import { GameSessionGuard } from './guards/game-session.guard';
import { HistoryComponent } from './components/history/history.component';

const routes: Routes = [
  { path: '', redirectTo: '/start', pathMatch: 'full' },
  { path: 'start', component: StartGameComponent },
  { path: 'team-selection', component: TeamSelectionComponent, canActivate: [GameSessionGuard] },
  { path: 'battle', component: BattleComponent, canActivate: [GameSessionGuard] },
  { path: 'swap', component: SwapComponent, canActivate: [GameSessionGuard] },
  { path: 'history/:playerName', component: HistoryComponent },
  { path: '**', redirectTo: '/start' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }