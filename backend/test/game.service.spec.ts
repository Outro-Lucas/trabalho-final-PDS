import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PokeApiService } from 'src/api/pokeapi.service';
import { AttemptHistory } from 'src/entities/attempt-history.entity';
import { GameSession } from 'src/entities/game-session.entity';
import { GameService } from 'src/services/game.service';
import { Repository } from 'typeorm';

describe('GameService', () => {
    let service: GameService;
    let gameSessionRepository: Repository<GameSession>;
    let attemptHistoryRepository: Repository<AttemptHistory>;
    let pokeApiService: PokeApiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: getRepositoryToken(GameSession),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(AttemptHistory),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: PokeApiService,
                    useValue: {
                        getRandomPokemon: jest.fn(),
                        generateOpponents: jest.fn(),
                        getPokemonById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        gameSessionRepository = module.get<Repository<GameSession>>(
            getRepositoryToken(GameSession),
        );
        attemptHistoryRepository = module.get<Repository<AttemptHistory>>(
            getRepositoryToken(AttemptHistory),
        );
        pokeApiService = module.get<PokeApiService>(PokeApiService);
    });

    it('deve iniciar um novo jogo', async () => {
        const mockPokemon = [
            { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] },
            { id: 2, name: 'ivysaur', types: ['grass', 'poison'] },
        ];

        const mockOpponents = [
            { trainerId: 1, name: 'Ash', difficulty: 'easy', pokemon: mockPokemon },
        ];

        jest.spyOn(pokeApiService, 'getRandomPokemon').mockResolvedValue(mockPokemon);
        jest.spyOn(pokeApiService, 'generateOpponents').mockResolvedValue(mockOpponents);
        jest.spyOn(gameSessionRepository, 'save').mockResolvedValue({
            sessionId: 'test-uuid',
            playerName: 'TestPlayer',
            rentalPokemon: mockPokemon,
            opponents: mockOpponents,
            gameState: 'TEAM_SELECTION',
        } as unknown as GameSession);

        const result = await service.startNewGame('TestPlayer');

        expect(result).toHaveProperty('sessionId');
        expect(result.playerName).toBe('TestPlayer');
        expect(result.gameState).toBe('TEAM_SELECTION');
    });

    it('deve selecionar time com 3 Pokémon', async () => {
        const mockSession = {
            sessionId: 'test-uuid',
            rentalPokemon: [
                { id: 1, name: 'bulbasaur' },
                { id: 2, name: 'ivysaur' },
                { id: 3, name: 'venusaur' },
                { id: 4, name: 'charmander' },
                { id: 5, name: 'charmeleon' },
                { id: 6, name: 'charizard' },
            ],
            playerTeam: [],
            gameState: 'TEAM_SELECTION',
        };

        jest.spyOn(gameSessionRepository, 'findOne').mockResolvedValue(mockSession as GameSession);
        jest.spyOn(gameSessionRepository, 'save').mockResolvedValue(mockSession as GameSession);

        const result = await service.selectTeam('test-uuid', [1, 2, 3]);

        expect(result.success).toBe(true);
        expect(result.playerTeam).toHaveLength(3);
        expect(result.gameState).toBe('BATTLE');
    });

    it('não deve permitir selecionar menos de 3 Pokémon', async () => {
        await expect(service.selectTeam('test-uuid', [1, 2]))
            .rejects.toThrow('Selecione exatamente 3 Pokémon');
    });
});