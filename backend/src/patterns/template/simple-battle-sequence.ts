import { BattleResult } from 'src/interfaces/battle-result.interface';
import { BattleSequence } from './battle-sequence.template';

export class SimpleBattleSequence extends BattleSequence {
    private damageCalculator: any;

    constructor(damageCalculator: any) {
        super();
        this.damageCalculator = damageCalculator;
    }

    protected async setupBattleField(session: any): Promise<void> {
        const opponent = session.opponents[session.currentBattle.opponentIndex];
        console.log(`Desafiando ${opponent.name} (${opponent.difficulty})`);
    }

    protected async executeTurn(session: any, turn: number): Promise<void> {
        // Jogador ataca
        const playerPokemon = this.getPlayerActivePokemon(session);
        const opponentPokemon = this.getOpponentActivePokemon(session);

        const playerMove = this.selectPlayerMove(playerPokemon);
        const damageResult = this.damageCalculator.calculateDamage(
            playerPokemon,
            opponentPokemon,
            playerMove,
            false
        );

        opponentPokemon.currentHp -= damageResult.damage;
        console.log(`${playerPokemon.name} usou ${playerMove.name}! ${damageResult.message}`);

        // Verificar se oponente desmaiou
        if (opponentPokemon.currentHp <= 0) {
            console.log(`${opponentPokemon.name} desmaiou!`);
            this.handlePokemonFainted(session, 'opponent');
        }

        // Oponente ataca (se ainda estiver vivo)
        if (opponentPokemon.currentHp > 0) {
            const opponentMove = this.selectOpponentMove(opponentPokemon);
            const opponentDamageResult = this.damageCalculator.calculateDamage(
                opponentPokemon,
                playerPokemon,
                opponentMove,
                false
            );

            playerPokemon.currentHp -= opponentDamageResult.damage;
            console.log(`${opponentPokemon.name} usou ${opponentMove.name}!`);

            // Verificar se jogador desmaiou
            if (playerPokemon.currentHp <= 0) {
                console.log(`${playerPokemon.name} desmaiou!`);
                this.handlePokemonFainted(session, 'player');
            }
        }
    }

    protected isBattleOver(session: any): boolean {
        const playerTeamAlive = session.playerTeam.some((p: any) => p.currentHp > 0);
        const opponentTeamAlive = this.getOpponentTeam(session).some((p: any) => p.currentHp > 0);

        return !playerTeamAlive || !opponentTeamAlive;
    }

    protected concludeBattle(session: any): BattleResult {
        const playerWon = session.playerTeam.some((p: any) => p.currentHp > 0);

        if (playerWon) {
            session.battlesWon++;
            console.log(`Vitória! Batalhas vencidas: ${session.battlesWon}`);
            return { victory: true, message: 'Você venceu a batalha!' };
        } else {
            console.log('Derrota!');
            return { victory: false, message: 'Você foi derrotado!' };
        }
    }

    private getPlayerActivePokemon(session: any): any {
        const pokemonId = session.playerTeam[session.currentBattle.playerActiveIndex].pokemonId;
        return session.rentalPokemon.find((p: any) => p.id === pokemonId);
    }

    private getOpponentActivePokemon(session: any): any {
        const opponent = session.opponents[session.currentBattle.opponentIndex];
        return opponent.pokemon[session.currentBattle.opponentActiveIndex];
    }

    private getOpponentTeam(session: any): any[] {
        return session.opponents[session.currentBattle.opponentIndex].pokemon;
    }

    private selectPlayerMove(pokemon: any): any {
        // Implementação simples: seleciona o primeiro movimento
        return pokemon.moves[0];
    }

    private selectOpponentMove(pokemon: any): any {
        // IA simples: seleciona movimento aleatório
        const randomIndex = Math.floor(Math.random() * pokemon.moves.length);
        return pokemon.moves[randomIndex];
    }

    private handlePokemonFainted(session: any, trainer: 'player' | 'opponent'): void {
        if (trainer === 'player') {
            // Encontrar próximo Pokémon disponível
            const nextIndex = this.findNextAlivePokemon(session.playerTeam);
            if (nextIndex !== -1) {
                session.currentBattle.playerActiveIndex = nextIndex;
            }
        } else {
            const opponentTeam = this.getOpponentTeam(session);
            const nextIndex = this.findNextAlivePokemon(opponentTeam.map((p: any, idx: number) => ({
                ...p,
                pokemonId: idx,
            })));

            if (nextIndex !== -1) {
                session.currentBattle.opponentActiveIndex = nextIndex;
            }
        }
    }

    private findNextAlivePokemon(team: any[]): number {
        for (let i = 0; i < team.length; i++) {
            if (team[i].currentHp > 0) {
                return i;
            }
        }
        return -1;
    }
}