import { AppDataSource } from '../database/data-source';
import { Session } from '../entity/Session';
import { History } from '../entity/History';
import { PokeApiAdapter } from '../adapter/PokeApiAdapter';

export class SessionService {
  private sessionRepo = AppDataSource.getRepository(Session);
  private historyRepo = AppDataSource.getRepository(History);
  private pokeApi = new PokeApiAdapter();

  async createSession(userId: string, difficulty: number): Promise<Session> {
    const session = this.sessionRepo.create({
      userId,
      difficulty,
      battle: 1,
      status: 'CREATED',
    });

    return this.sessionRepo.save(session);
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessionRepo.findOneBy({ id: sessionId });
  }

  async generatePokemons(sessionId: string): Promise<any[]> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new Error('Sessão não encontrada');

    if (session.status !== 'CREATED') {
      throw new Error('Pokémons já foram gerados');
    }

    const pokemons = await this.pokeApi.getRandomPokemons(6);

    session.availablePokemons = pokemons;
    session.status = 'POKEMONS_READY';

    await this.sessionRepo.save(session);
    return pokemons;
  }

  async defineTeam(sessionId: string, team: any[]): Promise<void> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new Error('Sessão não encontrada');

    if (session.status !== 'POKEMONS_READY') {
      throw new Error('Não é possível definir o time agora');
    }

    if (!team || team.length !== 3) {
      throw new Error('Time deve conter exatamente 3 pokémons');
    }

    session.team = team;
    session.status = 'READY';

    const cpuTeam = await this.pokeApi.getRandomPokemons(3);
    session.cpuTeam = cpuTeam;

    await this.sessionRepo.save(session);
  }

  async finishSession(
    sessionId: string,
    result: 'VICTORY' | 'DEFEAT' | 'CANCELLED'
  ): Promise<void> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new Error('Sessão não encontrada');

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
