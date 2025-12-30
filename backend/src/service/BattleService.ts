import { AppDataSource } from '../database/data-source';
import { Session } from '../entity/Session';

export class BattleService {
    private sessionRepo = AppDataSource.getRepository(Session);

    async startBattle(sessionId: string): Promise<Session> {
        const session = await this.getSession(sessionId);

        if (!session.team || !session.cpuTeam) {
            throw new Error('Times não definidos');
        }

        session.status = 'IN_BATTLE';
        session.turn = 'PLAYER';
        session.playerIndex = 0;
        session.cpuIndex = 0;

        return this.sessionRepo.save(session);
    }

    // dentro da classe BattleService (substitua os métodos correspondentes)

    async playerAttack(sessionId: string, moveIndex: number): Promise<Session> {
        const session = await this.getSession(sessionId);

        console.log(`[playerAttack] session=${sessionId} turn=${session.turn} playerIndex=${session.playerIndex} cpuIndex=${session.cpuIndex}`);

        if (session.turn !== 'PLAYER') {
            console.log(`[playerAttack][ERR] not player turn (turn=${session.turn})`);
            throw new Error('Não é o turno do jogador');
        }

        const player = session.team![session.playerIndex];
        const cpu = session.cpuTeam![session.cpuIndex];

        if (!player) {
            console.log('[playerAttack][ERR] player not found at index', session.playerIndex);
            throw new Error('Player pokemon not found');
        }
        if (!cpu) {
            console.log('[playerAttack][ERR] cpu not found at index', session.cpuIndex);
            throw new Error('CPU pokemon not found');
        }

        const move = player.moves && player.moves[moveIndex];
        if (!move) {
            console.log('[playerAttack][ERR] move invalid:', moveIndex, 'player.moves=', player.moves && player.moves.map((m: any) => m.name));
            throw new Error('Movimento inválido');
        }

        const beforeHp = cpu.currentHp;
        const damage = this.calculateDamage(player.attack, cpu.defense, move.power ?? 0);

        console.log(`[playerAttack] ${player.name} uses ${move.name} (power=${move.power}) against ${cpu.name} (hp before=${beforeHp}) -> damage=${damage}`);

        cpu.currentHp = Math.max(0, (Number(cpu.currentHp) || 0) - damage);

        console.log(`[playerAttack] ${cpu.name} hp after=${cpu.currentHp}`);

        // CPU morreu?
        if (cpu.currentHp === 0) {
            console.log(`[playerAttack] ${cpu.name} fainted, attempting advanceCpu()`);
            if (!this.advanceCpu(session)) {
                session.status = 'FINISHED';
                session.result = 'VICTORY';
                console.log('[playerAttack] CPU has no more pokemon -> PLAYER VICTORY');
                const saved = await this.sessionRepo.save(session);
                console.log('[playerAttack] saved session after victory', { id: saved.id, status: saved.status, result: saved.result });
                return saved;
            } else {
                console.log('[playerAttack] advanceCpu succeeded, new cpuIndex=', session.cpuIndex);
            }
        }

        session.turn = 'CPU';
        const saved = await this.sessionRepo.save(session);
        console.log('[playerAttack] saved session after player attack', {
            id: saved.id,
            turn: saved.turn,
            playerIndex: saved.playerIndex,
            cpuIndex: saved.cpuIndex,
            playerCurrentHp: saved.team && saved.team[saved.playerIndex] && saved.team[saved.playerIndex].currentHp,
            cpuCurrentHp: saved.cpuTeam && saved.cpuTeam[saved.cpuIndex] && saved.cpuTeam[saved.cpuIndex].currentHp,
        });

        return saved;
    }

    async cpuAttack(sessionId: string): Promise<Session> {
        const session = await this.getSession(sessionId);

        console.log(`[cpuAttack] session=${sessionId} turn=${session.turn} playerIndex=${session.playerIndex} cpuIndex=${session.cpuIndex}`);

        if (session.turn !== 'CPU') {
            console.log('[cpuAttack][ERR] not cpu turn (turn=', session.turn, ')');
            throw new Error('Não é o turno da CPU');
        }

        const cpu = session.cpuTeam![session.cpuIndex];
        const player = session.team![session.playerIndex];

        if (!cpu) {
            console.log('[cpuAttack][ERR] cpu not found at index', session.cpuIndex);
            throw new Error('CPU pokemon not found');
        }
        if (!player) {
            console.log('[cpuAttack][ERR] player not found at index', session.playerIndex);
            throw new Error('Player pokemon not found');
        }

        const move = cpu.moves && cpu.moves[Math.floor(Math.random() * cpu.moves.length)];
        if (!move) {
            console.log('[cpuAttack][ERR] cpu has no valid moves, cpu.moves=', cpu.moves);
            throw new Error('CPU has no valid move');
        }

        const beforeHp = player.currentHp;
        const damage = this.calculateDamage(cpu.attack, player.defense, move.power ?? 0);

        console.log(`[cpuAttack] ${cpu.name} uses ${move.name} (power=${move.power}) against ${player.name} (hp before=${beforeHp}) -> damage=${damage}`);

        player.currentHp = Math.max(0, (Number(player.currentHp) || 0) - damage);

        console.log(`[cpuAttack] ${player.name} hp after=${player.currentHp}`);

        // Jogador morreu?
        if (player.currentHp === 0) {
            console.log(`[cpuAttack] ${player.name} fainted, attempting advancePlayer()`);
            if (!this.advancePlayer(session)) {
                session.status = 'FINISHED';
                session.result = 'DEFEAT';
                console.log('[cpuAttack] Player has no more pokemon -> CPU VICTORY');
                const saved = await this.sessionRepo.save(session);
                console.log('[cpuAttack] saved session after defeat', { id: saved.id, status: saved.status, result: saved.result });
                return saved;
            } else {
                console.log('[cpuAttack] advancePlayer succeeded, new playerIndex=', session.playerIndex);
            }
        }

        session.turn = 'PLAYER';
        const saved = await this.sessionRepo.save(session);
        console.log('[cpuAttack] saved session after cpu attack', {
            id: saved.id,
            turn: saved.turn,
            playerIndex: saved.playerIndex,
            cpuIndex: saved.cpuIndex,
            playerCurrentHp: saved.team && saved.team[saved.playerIndex] && saved.team[saved.playerIndex].currentHp,
            cpuCurrentHp: saved.cpuTeam && saved.cpuTeam[saved.cpuIndex] && saved.cpuTeam[saved.cpuIndex].currentHp,
        });

        return saved;
    }

    async getBattleState(sessionId: string): Promise<Session> {
        return this.getSession(sessionId);
    }

    // =========================
    // Helpers
    // =========================

    private async getSession(sessionId: string): Promise<Session> {
        const session = await this.sessionRepo.findOneBy({ id: sessionId });
        if (!session) throw new Error('Sessão não encontrada');
        return session;
    }

    private calculateDamage(attack: number, defense: number, power: number): number {
        return Math.max(1, Math.floor((attack * power) / (defense + 10)));
    }

    /* helpers with logs */
    private advanceCpu(session: Session): boolean {
        const start = session.cpuIndex + 1;
        for (let i = start; i < (session.cpuTeam?.length || 0); i++) {
            const p = session.cpuTeam![i];
            if (p && (Number(p.currentHp) || 0) > 0) {
                session.cpuIndex = i;
                console.log('[advanceCpu] new cpuIndex=', i);
                return true;
            }
        }
        console.log('[advanceCpu] no remaining cpu pokemon');
        return false;
    }

    private advancePlayer(session: Session): boolean {
        const start = session.playerIndex + 1;
        for (let i = start; i < (session.team?.length || 0); i++) {
            const p = session.team![i];
            if (p && (Number(p.currentHp) || 0) > 0) {
                session.playerIndex = i;
                console.log('[advancePlayer] new playerIndex=', i);
                return true;
            }
        }
        console.log('[advancePlayer] no remaining player pokemon');
        return false;
    }

}
