import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Battle } from './pages/battle/battle';
import { Swap } from './pages/swap/swap';
import { Team } from './pages/team/team';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'team',
    component: Team,
  },
  {
    path: 'battle',
    component: Battle,
  },
  {
    path: `swap`,
    component: Swap,
  },
  {
    path: '**',
    redirectTo: '',
  }
];
