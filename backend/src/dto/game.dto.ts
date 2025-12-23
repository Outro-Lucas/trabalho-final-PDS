import { IsString, IsArray, IsNumber, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class StartGameDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    playerName: string;
}

export class SelectTeamDto {
    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    @IsNumber({}, { each: true })
    pokemonIds: number[];
}

export class BattleTurnDto {
    @IsNumber()
    moveIndex: number;
}

export class SwapPokemonDto {
    @IsNumber()
    playerPokemonId: number;

    @IsNumber()
    opponentPokemonId: number;
}