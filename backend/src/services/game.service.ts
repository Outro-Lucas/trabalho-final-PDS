import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PokeApiService } from 'src/api/pokeapi.service';
import { AttemptHistory } from 'src/entities/attempt-history.entity';
import { GameSession } from 'src/entities/game-session.entity';
import { ApiPokemonFactory } from 'src/patterns/factory/pokemon-factory';
import { AttemptHistoryObserver } from 'src/patterns/observer/attempt-history-observer';
import { GameNotifier } from 'src/patterns/observer/game-notifier';
import { SimpleDamageCalculator } from 'src/patterns/strategy/simple-damage-calculator';
import { SimpleBattleSequence } from 'src/patterns/template/simple-battle-sequence';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {
    private pokemonFactory: ApiPokemonFactory;
    private damageCalculator: SimpleDamageCalculator;
    private gameNotifier: GameNotifier;
    private battleSequence: SimpleBattleSequence;

    constructor(
        @InjectRepository(GameSession) private gameSessionRepository: Repository<GameSession>,
        @InjectRepository(AttemptHistory) private attemptHistoryRepository: Repository<AttemptHistory>,
        private pokeApiService: PokeApiService,
    ) {
        this.pokemonFactory = new ApiPokemonFactory(pokeApiService);
        this.damageCalculator = new SimpleDamageCalculator();
        this.gameNotifier = new GameNotifier();
        this.battleSequence = new SimpleBattleSequence(this.damageCalculator);

        // Registrar observador de histórico
        const historyObserver = new AttemptHistoryObserver(attemptHistoryRepository);
        this.gameNotifier.attach(historyObserver);
    }

    async startNewGame(playerName: string): Promise<any> {
        try {
            // 1. Gerar 6 Pokémon aleatórios para aluguel via PokeAPI
            const rentalPokemon = await this.pokeApiService.getRandomPokemon(6);

            // 2. Gerar 3 oponentes com times aleatórios
            const opponents = await this.pokeApiService.generateOpponents(3);

            // 3. Criar sessão de jogo - INICIALIZE TODOS OS CAMPOS OBRIGATÓRIOS
            const session = new GameSession();
            session.playerName = playerName;
            session.rentalPokemon = rentalPokemon;
            session.opponents = opponents;
            session.playerTeam = [];
            session.currentChallenge = 1;
            session.battlesWon = 0;
            session.pokemonSwapsAvailable = 0;
            session.gameState = 'TEAM_SELECTION';
            session.isCompleted = false;

            // 4. INICIALIZE currentBattle como null (já que ainda não começou a batalha)
            session.currentBattle = null;

            // 5. Inicialize swapsMade como array vazio
            session.swapsMade = [];

            const savedSession = await this.gameSessionRepository.save(session);

            // 6. Notificar início do jogo
            this.gameNotifier.notifyBattleStart(savedSession);

            return {
                sessionId: savedSession.sessionId,
                rentalPokemon: savedSession.rentalPokemon,
                playerName: savedSession.playerName,
                gameState: savedSession.gameState,
            };
        } catch (error) {
            console.error('Erro ao iniciar novo jogo:', error);
            throw error;
        }
    }

    async selectTeam(sessionId: string, pokemonIds: number[]): Promise<any> {
        const session = await this.gameSessionRepository.findOne({
            where: { sessionId },
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        if (pokemonIds.length !== 3) {
            throw new Error('Selecione exatamente 3 Pokémon');
        }

        // Validar se os Pokémon existem na lista de aluguel
        const invalidIds = pokemonIds.filter(id =>
            !session.rentalPokemon.some(p => p.id === id)
        );

        if (invalidIds.length > 0) {
            throw new Error(`IDs inválidos: ${invalidIds.join(', ')}`);
        }

        // Configurar time do jogador com HP calculado
        session.playerTeam = pokemonIds.map(id => {
            const pokemon = session.rentalPokemon.find(p => p.id === id);
            const maxHp = this.calculateHP(pokemon.baseStats.hp, 30);

            return {
                pokemonId: id,
                currentHp: maxHp,
                maxHp: maxHp,
                name: pokemon.name,
                types: pokemon.types,
            };
        });

        // Configurar batalha inicial - AGORA INICIALIZE currentBattle CORRETAMENTE
        session.currentBattle = {
            opponentIndex: 0,
            playerActiveIndex: 0,
            opponentActiveIndex: 0,
            turn: 1,
        };

        session.gameState = 'BATTLE';
        session.pokemonSwapsAvailable = 1;

        await this.gameSessionRepository.save(session);

        return {
            success: true,
            playerTeam: session.playerTeam,
            nextOpponent: session.opponents[0],
            gameState: session.gameState,
        };
    }

    async executeBattleTurn(sessionId: string, moveIndex: number): Promise<any> {
        const session = await this.gameSessionRepository.findOne({
            where: { sessionId },
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        if (session.gameState !== 'BATTLE') {
            throw new Error('Não está em batalha');
        }

        // Executar sequência de batalha usando Template Method
        const battleResult = await this.battleSequence.executeBattle(session);

        if (battleResult.victory) {
            session.battlesWon++;
            session.pokemonSwapsAvailable = 1;
            session.gameState = 'SWAP_DECISION';

            if (session.battlesWon >= 3) {
                session.gameState = 'GAME_OVER';
                session.result = 'VICTORY';
                session.isCompleted = true;
                session.completedAt = new Date();

                this.gameNotifier.notifyGameEnd(session, 'VICTORY');
            }
        } else {
            session.gameState = 'GAME_OVER';
            session.result = 'DEFEAT';
            session.isCompleted = true;
            session.completedAt = new Date();

            this.gameNotifier.notifyGameEnd(session, 'DEFEAT');
        }

        await this.gameSessionRepository.save(session);
        this.gameNotifier.notifyTurnComplete(session, battleResult);

        return {
            ...battleResult,
            session: {
                battlesWon: session.battlesWon,
                gameState: session.gameState,
                playerTeam: session.playerTeam,
            },
        };
    }

    async swapPokemon(sessionId: string, playerPokemonId: number, opponentPokemonId: number): Promise<any> {
        const session = await this.gameSessionRepository.findOne({
            where: { sessionId },
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        if (session.gameState !== 'SWAP_DECISION') {
            throw new Error('Não é possível trocar Pokémon agora');
        }

        if (session.pokemonSwapsAvailable <= 0) {
            throw new Error('Nenhuma troca disponível');
        }

        // Encontrar Pokémon do jogador
        const playerPokemonIndex = session.playerTeam.findIndex(
            p => p.pokemonId === playerPokemonId
        );

        if (playerPokemonIndex === -1) {
            throw new Error('Pokémon do jogador não encontrado');
        }

        // Encontrar Pokémon do oponente (sem revelar stats)
        const currentOpponent = session.opponents[session.currentBattle.opponentIndex];
        const opponentPokemon = currentOpponent.pokemon[opponentPokemonId];

        if (!opponentPokemon) {
            throw new Error('Pokémon do oponente não encontrado');
        }

        // Realizar troca
        const swappedPokemon = session.playerTeam[playerPokemonIndex];
        session.playerTeam[playerPokemonIndex] = {
            pokemonId: opponentPokemonId,
            currentHp: opponentPokemon.currentHp,
            maxHp: opponentPokemon.maxHp,
        };

        // Atualizar oponente
        currentOpponent.pokemon[opponentPokemonId] = {
            ...opponentPokemon,
            currentHp: swappedPokemon.currentHp,
            maxHp: swappedPokemon.maxHp,
        };

        session.pokemonSwapsAvailable--;
        session.currentChallenge++;
        session.gameState = 'BATTLE';

        // Registrar troca
        if (!session.swapsMade) session.swapsMade = [];
        session.swapsMade.push({
            oldPokemon: swappedPokemon.name,
            newPokemon: opponentPokemon.name,
            atBattle: session.currentChallenge,
        });

        await this.gameSessionRepository.save(session);

        return {
            success: true,
            swapped: true,
            playerTeam: session.playerTeam,
            pokemonSwapsAvailable: session.pokemonSwapsAvailable,
            gameState: session.gameState,
        };
    }

    async getGameStatus(sessionId: string): Promise<any> {
        const session = await this.gameSessionRepository.findOne({
            where: { sessionId },
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        return {
            sessionId: session.sessionId,
            playerName: session.playerName,
            gameState: session.gameState,
            battlesWon: session.battlesWon,
            currentChallenge: session.currentChallenge,
            playerTeam: session.playerTeam,
            pokemonSwapsAvailable: session.pokemonSwapsAvailable,
            currentBattle: session.currentBattle,
            isCompleted: session.isCompleted,
            result: session.result,
        };
    }

    async getPlayerHistory(playerName: string): Promise<any> {
        const history = await this.attemptHistoryRepository.find({
            where: { playerName },
            order: { completedAt: 'DESC' },
            take: 10,
        });

        return {
            playerName,
            totalAttempts: history.length,
            victories: history.filter(h => h.result === 'VICTORY').length,
            attempts: history.map(h => ({
                date: h.completedAt,
                result: h.result,
                battlesWon: h.battlesWon,
                teamUsed: h.teamUsed,
                swapsMade: h.swapsMade,
                totalTurns: h.totalTurns,
            })),
        };
    }

    private calculateHP(baseHP: number, level: number): number {
        return Math.floor(((2 * baseHP * level) / 100) + level + 10);
    }


    async cancelGame(sessionId: string): Promise<any> {
        const session = await this.gameSessionRepository.findOne({
            where: { sessionId },
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        session.gameState = 'GAME_OVER';
        session.result = 'CANCELLED';
        session.isCompleted = true;
        session.completedAt = new Date();

        await this.gameSessionRepository.save(session);

        this.gameNotifier.notifyGameEnd(session, 'CANCELLED');

        return {
            success: true,
            gameState: session.gameState,
            result: session.result,
        };
    }
}