import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { StartGameDto, SelectTeamDto, BattleTurnDto, SwapPokemonDto } from '../dto/game.dto';

@Controller('api/game')
export class GameController {
    constructor(private gameService: GameService) { }

    @Post('start')
    async startGame(@Body() dto: StartGameDto) {
        try {
            return await this.gameService.startNewGame(dto.playerName);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post(':sessionId/select-team')
    async selectTeam(
        @Param('sessionId') sessionId: string,
        @Body() dto: SelectTeamDto,
    ) {
        try {
            return await this.gameService.selectTeam(sessionId, dto.pokemonIds);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':sessionId/battle/turn')
    async executeTurn(
        @Param('sessionId') sessionId: string,
        @Body() dto: BattleTurnDto,
    ) {
        try {
            return await this.gameService.executeBattleTurn(sessionId, dto.moveIndex);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post(':sessionId/swap')
    async swapPokemon(
        @Param('sessionId') sessionId: string,
        @Body() dto: SwapPokemonDto,
    ) {
        try {
            return await this.gameService.swapPokemon(
                sessionId,
                dto.playerPokemonId,
                dto.opponentPokemonId,
            );
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get(':sessionId/status')
    async getGameStatus(@Param('sessionId') sessionId: string) {
        try {
            return await this.gameService.getGameStatus(sessionId);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.NOT_FOUND,
            );
        }
    }

    @Get('history/:playerName')
    async getPlayerHistory(@Param('playerName') playerName: string) {
        try {
            return await this.gameService.getPlayerHistory(playerName);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':sessionId/cancel')
    async cancelGame(@Param('sessionId') sessionId: string) {
        try {
            return await this.gameService.cancelGame(sessionId);
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.NOT_FOUND,
            );
        }
    }
}