import { SessionService } from "./SessionService";

type Turn = 'PLAYER' | 'CPU';

interface Move {
    name: string;
    power: number;
    type: string;
}

interface BattlePokemon {
    name: string;
    hp: number;
    attack: number;
    defense: number;
    currentHp: number;
    moves: Move[];
}

interface BattleState {
    sessionId: string;
    turn: Turn;
    playerIndex: number;
    cpuIndex: number;
    playerTeam: BattlePokemon[];
    cpuTeam: BattlePokemon[];
    finished?: boolean;
    winner?: 'PLAYER' | 'CPU';
    log?: string;
    forcedSwitch?: boolean;
}

export class BattleService {
    private battles = new Map<string, BattleState>();
    private sessionService = new SessionService();

    async startBattle(sessionId: string): Promise<BattleState> {
        if (this.battles.has(sessionId)) {
            return this.battles.get(sessionId)!;
        }

        const session = await this.sessionService.getSessionById(sessionId);
        if (!session) throw new Error('Session not found');

        if (!session.team || session.team.length === 0) {
            throw new Error('Session has no player team');
        }

        if (!session.cpuTeam || session.cpuTeam.length === 0) {
            throw new Error('Session has no cpu team');
        }

        const playerTeam = session.team.map(p => ({
            ...p,
            currentHp: p.hp
        }));

        const cpuTeam = session.cpuTeam.map(p => ({
            ...p,
            currentHp: p.hp
        }));

        const state = this.initialize(sessionId, playerTeam, cpuTeam);
        return state;
    }


    async getState(sessionId: string): Promise<BattleState> {
        const battle = this.battles.get(sessionId);
        if (!battle) throw new Error('Battle not found');
        return battle;
    }

    initialize(sessionId: string, playerTeam: BattlePokemon[], cpuTeam: BattlePokemon[]) {
        const state: BattleState = {
            sessionId,
            turn: 'PLAYER',
            playerIndex: 0,
            cpuIndex: 0,
            playerTeam,
            cpuTeam
        };
        this.battles.set(sessionId, state);
        return state;
    }

    async playerAttack(sessionId: string, moveIndex: number): Promise<BattleState> {
        const battle = this.get(sessionId);
        if (battle.turn !== 'PLAYER') throw new Error('Not player turn');

        const attacker = battle.playerTeam[battle.playerIndex];
        const defender = battle.cpuTeam[battle.cpuIndex];
        const move = attacker.moves[moveIndex];

        const damage = this.calculateDamage(attacker.attack, defender.defense, move.power);
        defender.currentHp = Math.max(0, defender.currentHp - damage);

        battle.log = `${attacker.name} used ${move.name} and dealt ${damage} damage`;

        if (defender.currentHp === 0) {
            if (!this.advanceCpu(battle)) {
                battle.finished = true;
                battle.winner = 'PLAYER';
                return battle;
            }
        }

        battle.turn = 'CPU';
        return battle;
    }

    async cpuAttack(sessionId: string): Promise<BattleState> {
        const battle = this.get(sessionId);
        if (battle.turn !== 'CPU') throw new Error('Not CPU turn');

        const attacker = battle.cpuTeam[battle.cpuIndex];
        const defender = battle.playerTeam[battle.playerIndex];
        const move = attacker.moves[Math.floor(Math.random() * attacker.moves.length)];

        const damage = this.calculateDamage(attacker.attack, defender.defense, move.power);
        defender.currentHp = Math.max(0, defender.currentHp - damage);

        battle.log = `${attacker.name} used ${move.name} and dealt ${damage} damage`;

        if (defender.currentHp === 0) {
            if (!this.advancePlayer(battle)) {
                battle.finished = true;
                battle.winner = 'CPU';
                return battle;
            }
            battle.forcedSwitch = true;
        }

        battle.turn = 'PLAYER';
        return battle;
    }

    async switchPokemon(sessionId: string, newIndex: number): Promise<BattleState> {
        const battle = this.get(sessionId);

        if (battle.playerTeam[newIndex].currentHp <= 0) {
            throw new Error('Cannot switch to fainted pokemon');
        }

        battle.playerIndex = newIndex;
        battle.forcedSwitch = false;
        return battle;
    }

    async continueBattle(sessionId: string): Promise<BattleState> {
        const battle = this.get(sessionId);
        return battle;
    }

    private calculateDamage(atk: number, def: number, power: number): number {
        return Math.max(1, Math.floor((atk / def) * power * 0.5));
    }

    private advanceCpu(battle: BattleState): boolean {
        const next = battle.cpuTeam.findIndex(p => p.currentHp > 0);
        if (next === -1) return false;
        battle.cpuIndex = next;
        return true;
    }

    private advancePlayer(battle: BattleState): boolean {
        const next = battle.playerTeam.findIndex(p => p.currentHp > 0);
        if (next === -1) return false;
        battle.playerIndex = next;
        return true;
    }

    private get(sessionId: string): BattleState {
        const battle = this.battles.get(sessionId);
        if (!battle) throw new Error('Battle not initialized');
        return battle;
    }
}
