export interface Session {
  id: string;
  userId: string;
  difficulty: number;
  battle: number;
  status: 'READY' | 'IN_BATTLE' | 'FINISHED';
  turn: 'PLAYER' | 'CPU' | null;
  team: any[] | null;
  cpuTeam: any[] | null;
  playerIndex: number;
  cpuIndex: number;
  result: 'VICTORY' | 'DEFEAT' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewSession {
  userId: string;
  difficulty: number;
}