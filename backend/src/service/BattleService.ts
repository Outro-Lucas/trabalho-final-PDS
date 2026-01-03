import { AppDataSource } from '../database/data-source';
import { Session } from '../entity/Session';
import { PokeApiAdapter } from '../adapter/PokeApiAdapter';
import { SessionService } from './SessionService';

export class BattleService {
    private sessionRepo = AppDataSource.getRepository(Session);
    private pokeApi = new PokeApiAdapter();
    private sessionService = new SessionService();

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

    async playerAttack(sessionId: string, moveIndex: number): Promise<Session> {
        const session = await this.getSession(sessionId);

        if (session.turn !== 'PLAYER') {
            throw new Error('Não é o turno do jogador');
        }

        const player = session.team![session.playerIndex];
        if (!player || player.currentHp <= 0) {
            if (!this.advancePlayer(session)) {
                return this.finishSession(session.id, 'DEFEAT');
            }
        }
        const cpu = session.cpuTeam![session.cpuIndex];
        const move = player.moves[moveIndex];

        const damage = this.calculateDamage(player.attack, cpu.defense, (move && move.power) || 0);
        cpu.currentHp = Math.max(0, (Number(cpu.currentHp) || 0) - damage);

        // CPU morreu?
        if (cpu.currentHp === 0) {
            // se não houver mais pokémon vivo na cpu, jogador vence esta batalha
            if (!this.advanceCpu(session)) {
                // batalha vencida (não encerra sessão)
                session.status = 'FINISHED';
                session.result = 'VICTORY';
                await this.sessionRepo.save(session);
                return session;
            }
        }

        session.turn = 'CPU';
        await this.sessionRepo.save(session);
        return session;
    }

    async cpuAttack(sessionId: string): Promise<Session> {
        const session = await this.getSession(sessionId);

        if (session.turn !== 'CPU') {
            throw new Error('Não é o turno da CPU');
        }

        let cpu = session.cpuTeam![session.cpuIndex];

        // se o pokemon atual estiver morto, tenta avançar para o próximo
        if (!cpu || cpu.currentHp <= 0) {
            if (!this.advanceCpu(session)) {
                // todos os pokemons da CPU morreram -> jogador vence a batalha atual
                session.status = 'FINISHED';
                session.result = 'VICTORY';
                await this.sessionRepo.save(session);
                return session;
            }
            cpu = session.cpuTeam![session.cpuIndex];
        }

        const player = session.team![session.playerIndex];

        const move =
            cpu.moves[Math.floor(Math.random() * cpu.moves.length)];

        const damage = this.calculateDamage(cpu.attack, player.defense, (move && move.power) || 0);
        player.currentHp = Math.max(0, (Number(player.currentHp) || 0) - damage);

        // jogador morreu?
        if (player.currentHp === 0) {
            if (!this.advancePlayer(session)) {
                // jogador perdeu a sessão -> salva manualmente e retorna
                session.status = 'FINISHED';
                session.result = 'DEFEAT';
                await this.sessionRepo.save(session);
                return session;
            }
            // se ainda tiver pokemons vivos, continua automaticamente; playerIndex já atualizado
        }

        session.turn = 'PLAYER';
        await this.sessionRepo.save(session);
        return session;
    }

    async applyReward(
        sessionId: string,
        loseIndex: number,
        cpuIndex: number
    ): Promise<Session> {
        const session = await this.getSession(sessionId);

        // recompensa é por batalha vencida, não por fim de sessão
        if (session.status !== 'FINISHED' || session.result !== 'VICTORY') {
            throw new Error('Recompensa só disponível após vitória da batalha atual');
        }

        if (!Array.isArray(session.team) || !Array.isArray(session.cpuTeam)) {
            throw new Error('Times inválidos');
        }

        if (loseIndex < 0 || loseIndex >= session.team.length) {
            throw new Error('Índice de remoção inválido');
        }

        if (cpuIndex < 0 || cpuIndex >= session.cpuTeam.length) {
            throw new Error('Índice de ganho inválido');
        }

        const lostPokemon = session.team[loseIndex];
        const gainedPokemon = { ...session.cpuTeam[cpuIndex] };

        if (!lostPokemon) {
            throw new Error('Pokémon a ser removido não existe');
        }

        // novo pokemon entra com HP cheio
        gainedPokemon.currentHp = gainedPokemon.hp;

        // troca direta no slot
        session.team[loseIndex] = gainedPokemon;

        // remove da cpuTeam para evitar múltiplos ganhos
        session.cpuTeam.splice(cpuIndex, 1);

        // IMPORTANTE:
        // não muda status, result ou battle aqui
        // isso é responsabilidade do nextBattle
        return this.sessionRepo.save(session);
    }

    async nextBattle(sessionId: string): Promise<Session> {
        console.log('[NEXT] 1 - iniciando nextBattle', { sessionId });

        const session = await this.getSession(sessionId);
        console.log('[NEXT] 2 - sessão carregada', {
            id: session.id,
            battle: session.battle,
            status: session.status,
            result: session.result,
        });

        if (session.result !== 'VICTORY' || session.status !== 'FINISHED') {
            console.log('[NEXT] ERRO - estado inválido');
            throw new Error('Não é possível iniciar próxima batalha agora');
        }

        console.log('[NEXT] 4 - incrementando batalha');
        session.battle = session.battle + 1;

        console.log('[NEXT] 5 - restaurando HP do time do jogador');
        if (Array.isArray(session.team)) {
            session.team = session.team.map((p: any) => ({
                ...p,
                currentHp: p.hp,
            }));
        }

        console.log('[NEXT] 6 - chamando PokeAPI para gerar time CPU');
        const startApi = Date.now();

        const newCpuTeamRaw = await this.pokeApi.getRandomPokemons(3);

        console.log('[NEXT] 7 - PokeAPI respondeu', {
            durationMs: Date.now() - startApi,
            count: newCpuTeamRaw?.length,
        });

        session.cpuTeam = newCpuTeamRaw.map((p: any) => ({
            ...p,
            currentHp: p.hp,
        }));

        console.log('[NEXT] 8 - resetando índices e turno');
        session.playerIndex = 0;
        session.cpuIndex = 0;
        session.turn = 'PLAYER';
        session.status = 'IN_BATTLE';
        session.result = null;

        console.log('[NEXT] 9 - salvando sessão no banco');
        const startSave = Date.now();

        const saved = await this.sessionRepo.save(session);

        console.log('[NEXT] 10 - sessão salva', {
            durationMs: Date.now() - startSave,
            battle: saved.battle,
        });

        console.log('[NEXT] 11 - nextBattle concluído com sucesso');
        return saved;
    }

    async finishSession(
        sessionId: string,
        result: 'VICTORY' | 'DEFEAT'
    ): Promise<Session> {
        const session = await this.getSession(sessionId);

        return this.finishSessionInternal(session, result);
    }

    private async finishSessionInternal(
        session: Session,
        result: 'VICTORY' | 'DEFEAT'
    ): Promise<Session> {
        session.status = 'FINISHED';
        session.result = result;

        await this.sessionRepo.save(session);
        await this.sessionService.finishSession(session.id, result);

        return session;
    }

    async getBattleState(sessionId: string): Promise<Session> {
        return this.getSession(sessionId);
    }

    private async getSession(sessionId: string): Promise<Session> {
        const session = await this.sessionRepo.findOneBy({ id: sessionId });
        if (!session) throw new Error('Sessão não encontrada');
        return session;
    }

    private calculateDamage(attack: number, defense: number, power: number): number {
        return Math.max(1, Math.floor((attack * power) / (defense + 10)));
    }

    private advanceCpu(session: Session): boolean {
        const start = (Number(session.cpuIndex) || 0) + 1;
        for (let i = start; i < (session.cpuTeam?.length || 0); i++) {
            const p = session.cpuTeam![i];
            if (p && (Number(p.currentHp) || 0) > 0) {
                session.cpuIndex = i;
                return true;
            }
        }
        return false;
    }

    private advancePlayer(session: Session): boolean {
        const start = (Number(session.playerIndex) || 0) + 1;
        for (let i = start; i < (session.team?.length || 0); i++) {
            const p = session.team![i];
            if (p && (Number(p.currentHp) || 0) > 0) {
                session.playerIndex = i;
                return true;
            }
        }
        return false;
    }
}