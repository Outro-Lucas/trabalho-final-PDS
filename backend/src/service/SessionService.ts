import { AppDataSource } from '../database/data-source';
import { Session } from '../entity/Session';
import { History } from '../entity/History';
import { PokeApiAdapter } from '../adapter/PokeApiAdapter';

export class SessionService {
  private sessionRepo = AppDataSource.getRepository(Session);
  private historyRepo = AppDataSource.getRepository(History);
  private pokeApi = new PokeApiAdapter();

  async createSession(userId: string, difficulty: 1 | 2 | 3): Promise<Session> {
    const session = new Session();

    session.userId = userId;
    session.difficulty = difficulty;
    session.battle = 1;
    session.status = 'READY';
    session.team = null;
    session.cpuTeam = null;
    session.result = null;
    session.turn = null;
    session.playerIndex = 0;
    session.cpuIndex = 0;

    return this.sessionRepo.save(session);
  }

  /**
   * Retorna a sessão pelo ID
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessionRepo.findOneBy({ id: sessionId });
  }

  /**
   * Apenas gera 6 pokémons aleatórios (não persiste)
   */
  async generatePokemons(): Promise<any[]> {
    return this.pokeApi.getRandomPokemons(6);
  }

  /**
   * Define o time do jogador e gera o time da CPU
   */
  async defineTeam(sessionId: string, team: any[]): Promise<Session> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.status !== 'READY') {
      throw new Error('Não é possível definir o time neste estado');
    }

    if (!team || team.length !== 3) {
      throw new Error('O time deve conter exatamente 3 pokémons');
    }

    const initializedTeam = team.map(pokemon => ({
      ...pokemon,
      currentHp: pokemon.hp,
    }));

    const cpuTeamRaw = await this.pokeApi.getRandomPokemons(3);
    const cpuTeam = cpuTeamRaw.map(pokemon => ({
      ...pokemon,
      currentHp: pokemon.hp,
    }));

    session.team = initializedTeam;
    session.cpuTeam = cpuTeam;
    session.status = 'READY';
    session.turn = 'PLAYER';
    session.playerIndex = 0;
    session.cpuIndex = 0;

    return this.sessionRepo.save(session);
  }

  /**
   * Finaliza a sessão e grava histórico
   */
  async finishSession(
    sessionId: string,
    result: 'VICTORY' | 'DEFEAT'
  ): Promise<void> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.status === 'FINISHED') {
      throw new Error('Sessão já finalizada');
    }

    session.result = result;
    session.status = 'FINISHED';

    await this.sessionRepo.save(session);

    const history = this.historyRepo.create({
      userId: session.userId,
      difficulty: session.difficulty,
      battle: session.battle,
      sessionId: session.id,
      result,
    });

    await this.historyRepo.save(history);
  }
}
