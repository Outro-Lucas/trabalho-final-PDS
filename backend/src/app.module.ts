import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from './entities/game-session.entity';
import { AttemptHistory } from './entities/attempt-history.entity';
import { GameSessionPokemon } from './entities/game-session-pokemon.entity';
import { GameController } from './controllers/game.controller';
import { GameService } from './services/game.service';
import { PokeApiService } from './api/pokeapi.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'pokemon-battle-tent.db',
      entities: [GameSession, AttemptHistory, GameSessionPokemon],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([GameSession, AttemptHistory, GameSessionPokemon]),
  ],
  controllers: [GameController],
  providers: [GameService, PokeApiService],
})
export class AppModule { }