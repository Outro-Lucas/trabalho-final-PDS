export interface SessionIdBody {
  sessionId: string;
}

export interface PlayerAttack {
  sessionId: string;
  moveIndex: number;
}

export interface SwapPokemon {
  sessionId: string;
  loseIndex: number;
  cpuIndex: number;
}