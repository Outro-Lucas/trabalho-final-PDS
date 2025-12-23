import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameSession } from '../../models/game.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css']
})
export class BattleComponent implements OnInit {
  session: GameSession | null = null;
  playerActivePokemon: any = null;
  opponentActivePokemon: any = null;
  currentOpponent: any = null;
  battleLog: string[] = [];
  isLoading = false;
  isBattleOver = false;
  battleResult: any = null;

  constructor(private gameService: GameService, private router: Router) { }

  ngOnInit() {
    this.loadBattleData();
  }

  loadBattleData() {
    const sessionId = this.gameService.currentSessionIdValue;

    if (!sessionId) {
      this.router.navigate(['/start']); // MANTENHA APENAS ESTE
      return;
    }

    this.gameService.getGameStatus(sessionId).subscribe({
      next: (session) => {
        console.log('Session loaded:', session);
        this.session = session;

        // NÃO redirecione se o gameState for BATTLE
        // O componente já deve estar na rota /battle
        this.gameService.setCurrentSession(session);

        this.initializeBattle();
      },
      error: (error) => {
        console.error('Error loading battle data:', error);
        Swal.fire('Error', 'Failed to load battle data', 'error');
        this.router.navigate(['/start']); // Só redirecione em caso de erro
      }
    });
  }

  initializeBattle() {
    if (!this.session) return;

    console.log('Session in initializeBattle:', this.session);
    console.log('GameState:', this.session.gameState);

    // Se não estiver em BATTLE, redirecione
    if (this.session.gameState !== 'BATTLE') {
      console.warn('Not in BATTLE state, redirecting:', this.session.gameState);

      if (this.session.gameState === 'TEAM_SELECTION') {
        this.router.navigate(['/team-selection']);
      } else if (this.session.gameState === 'SWAP_DECISION') {
        this.router.navigate(['/swap']);
      } else if (this.session.gameState === 'GAME_OVER') {
        this.router.navigate(['/start']);
      }
      return;
    }

    // 1. Encontrar oponente atual
    const opponentIndex = this.session.currentBattle?.opponentIndex || 0;
    if (this.session.opponents && this.session.opponents.length > opponentIndex) {
      this.currentOpponent = this.session.opponents[opponentIndex];
      console.log('Current opponent:', this.currentOpponent);
    } else {
      console.error('No opponent found');
      this.currentOpponent = {
        name: 'Wild Pokémon',
        difficulty: 'medium',
        pokemon: [{
          name: 'Unknown',
          sprite: this.getDefaultSprite(),
          types: ['normal'],
          currentHp: 100,
          maxHp: 100,
          moves: this.getDefaultMoves()
        }]
      };
    }

    // 2. Encontrar Pokémon ativo do jogador
    const playerActiveIndex = this.session.currentBattle?.playerActiveIndex || 0;
    if (this.session.playerTeam && this.session.playerTeam.length > playerActiveIndex) {
      const playerTeamMember = this.session.playerTeam[playerActiveIndex];

      // Buscar dados completos do Pokémon nos rentalPokemon
      if (this.session.rentalPokemon) {
        this.playerActivePokemon = this.session.rentalPokemon.find(
          p => p.id === playerTeamMember.pokemonId
        );
      }

      // Se não encontrou, criar Pokémon básico
      if (!this.playerActivePokemon) {
        this.playerActivePokemon = {
          name: playerTeamMember.name || 'Unknown',
          sprite: this.getDefaultSprite(),
          types: playerTeamMember.types || ['normal'],
          currentHp: playerTeamMember.currentHp,
          maxHp: playerTeamMember.maxHp,
          moves: this.getDefaultMoves()
        };
      } else {
        // Garantir que tenha HP atual
        this.playerActivePokemon.currentHp = playerTeamMember.currentHp;
        this.playerActivePokemon.maxHp = playerTeamMember.maxHp;
      }
    }

    // 3. Encontrar Pokémon ativo do oponente
    const opponentActiveIndex = this.session.currentBattle?.opponentActiveIndex || 0;
    if (this.currentOpponent.pokemon && this.currentOpponent.pokemon.length > opponentActiveIndex) {
      this.opponentActivePokemon = this.currentOpponent.pokemon[opponentActiveIndex];
    } else {
      this.opponentActivePokemon = {
        name: 'Unknown',
        sprite: this.getDefaultSprite(),
        types: ['normal'],
        currentHp: 100,
        maxHp: 100,
        moves: this.getDefaultMoves()
      };
    }

    // 4. Inicializar log de batalha
    if (this.battleLog.length === 0) {
      this.battleLog.push(`Battle against ${this.currentOpponent.name} begins!`);
      this.battleLog.push(`Go, ${this.playerActivePokemon?.name}!`);
    }

    console.log('Battle initialized:', {
      player: this.playerActivePokemon,
      opponent: this.opponentActivePokemon
    });
  }

  executeTurn(moveIndex: number) {
    if (!this.session || this.isLoading || this.isBattleOver) return;

    this.isLoading = true;

    this.gameService.executeTurn(this.session.sessionId, moveIndex).subscribe({
      next: (result) => {
        console.log('Battle turn result:', result);
        this.battleResult = result;
        this.isLoading = false;

        // Processar resultado
        this.processBattleResult(result);

        // Recarregar dados da sessão
        this.loadBattleData();
      },
      error: (error) => {
        console.error('Battle turn error:', error);
        this.isLoading = false;
        Swal.fire('Error', 'Battle turn failed: ' + error.message, 'error');
      }
    });
  }

  processBattleResult(result: any) {
    // Adicionar ações ao log
    if (result.playerAction) {
      this.battleLog.push(
        `${result.playerAction.attacker} used ${result.playerAction.move}!`
      );
      this.battleLog.push(
        `${result.playerAction.effectiveness} Dealt ${result.playerAction.damage} damage.`
      );

      if (result.playerAction.opponentFainted) {
        this.battleLog.push(`${this.opponentActivePokemon?.name || 'Opponent'} fainted!`);
      }
    }

    if (result.opponentAction) {
      this.battleLog.push(
        `${result.opponentAction.attacker} used ${result.opponentAction.move}!`
      );
      this.battleLog.push(
        `Dealt ${result.opponentAction.damage} damage.`
      );

      if (result.opponentAction.playerFainted) {
        this.battleLog.push(`${this.playerActivePokemon?.name || 'Your Pokémon'} fainted!`);
      }
    }

    // Verificar se a batalha acabou
    if (result.battleStatus?.isBattleOver) {
      this.isBattleOver = true;
      this.battleLog.push(result.battleStatus.message || 'Battle ended!');
    }
  }

  getHPPercentage(pokemon: any): number {
    if (!pokemon || pokemon.maxHp <= 0) return 0;
    return (pokemon.currentHp / pokemon.maxHp) * 100;
  }

  getTypeColor(type: string): string {
    return this.gameService.getTypeColor(type);
  }

  getDefaultSprite(): string {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
  }

  getDefaultMoves(): any[] {
    return [
      { name: 'Tackle', type: 'normal', power: 40, accuracy: 100, pp: 35 },
      { name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, pp: 30 },
      { name: 'Body Slam', type: 'normal', power: 85, accuracy: 100, pp: 15 },
      { name: 'Hyper Beam', type: 'normal', power: 150, accuracy: 90, pp: 5 }
    ];
  }

  goToSwap() {
    if (this.session) {
      this.router.navigate(['/swap']);
    }
  }

  nextBattle() {
    // Recarregar para próxima batalha
    this.isBattleOver = false;
    this.battleLog = [];
    this.loadBattleData();
  }

  endGame() {
    Swal.fire({
      title: 'Challenge Complete!',
      text: `Congratulations ${this.session?.playerName}! You've won all 3 battles!`,
      icon: 'success',
      confirmButtonText: 'View History'
    }).then(() => {
      if (this.session?.playerName) {
        this.router.navigate(['/history', this.session.playerName]);
      } else {
        this.router.navigate(['/start']);
      }
    });
  }

  restartGame() {
    this.gameService.clearCurrentSession();
    this.router.navigate(['/start']);
  }

}