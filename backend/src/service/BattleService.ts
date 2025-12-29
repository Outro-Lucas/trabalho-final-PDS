import { AppDataSource } from '../database/data-source';
import { Session } from '../entity/Session';
import { PokeApiAdapter } from '../adapter/PokeApiAdapter';

export class BattleService {
    private sessionRepo = AppDataSource.getRepository(Session);
    private pokeApi = new PokeApiAdapter();

    async startBattle(sessionId: string) {
        const session = await this.sessionRepo.findOneBy({ id: sessionId });
        if (!session) throw new Error('Sessão não encontrada');

        if (session.status !== 'READY') {
            throw new Error('Sessão não está pronta para batalha');
        }

        const cpuTeam = await this.pokeApi.getRandomPokemons(3);

        session.battleState = {
            turn: 'PLAYER',
            playerIndex: 0,
            cpuIndex: 0,
            playerTeam: session.team!.map(p => ({ ...p, currentHp: p.hp })),
            cpuTeam: cpuTeam.map(p => ({ ...p, currentHp: p.hp })),
        };

        await this.sessionRepo.save(session);
        return session.battleState;
    }

    async playerAttack(sessionId: string, moveName: string) {
        const session = await this.sessionRepo.findOneBy({ id: sessionId });
        if (!session || !session.battleState) {
            throw new Error('Batalha não iniciada');
        }

        const state = session.battleState;

        if (state.turn !== 'PLAYER') {
            throw new Error('Não é o turno do jogador');
        }

        const attacker = state.playerTeam[state.playerIndex];
        const defender = state.cpuTeam[state.cpuIndex];

        const move = attacker.moves.find((m: any) => m.name === moveName);
        if (!move) throw new Error('Movimento inválido');

        defender.currentHp -= this.calculateDamage(attacker, defender, move);

        if (defender.currentHp <= 0) {
            state.cpuIndex++;
        }

        if (state.cpuIndex >= state.cpuTeam.length) {
            await this.finishBattle(session, 'VICTORY');
            return { result: 'VICTORY', state };
        }

        state.turn = 'CPU';

        // CPU ataca automaticamente
        this.cpuAttack(state);

        if (state.playerIndex >= state.playerTeam.length) {
            await this.finishBattle(session, 'DEFEAT');
            return { result: 'DEFEAT', state };
        }

        state.turn = 'PLAYER';

        await this.sessionRepo.save(session);
        return { result: 'ONGOING', state };
    }

    private cpuAttack(state: any) {
        const attacker = state.cpuTeam[state.cpuIndex];
        const defender = state.playerTeam[state.playerIndex];

        const move = attacker.moves.reduce((best: any, current: any) =>
            current.power > best.power ? current : best
        );

        defender.currentHp -= this.calculateDamage(attacker, defender, move);

        if (defender.currentHp <= 0) {
            state.playerIndex++;
        }
    }

    private calculateDamage(attacker: any, defender: any, move: any): number {
        const base = move.power;
        const attackFactor = attacker.attack / defender.defense;
        return Math.max(1, Math.floor(base * attackFactor * 0.5));
    }

    private async finishBattle(session: Session, result: 'VICTORY' | 'DEFEAT') {
        session.result = result;
        session.status = 'FINISHED';
        await this.sessionRepo.save(session);
    }
}
