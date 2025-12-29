import { AppDataSource } from '../database/data-source';
import { Session } from '../entity/Session';

export class SessionRepository {
  private repository = AppDataSource.getRepository(Session);

  async save(session: Session): Promise<Session> {
    return this.repository.save(session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.repository.findOneBy({ id });
  }

  async update(session: Session): Promise<Session> {
    return this.repository.save(session);
  }
}
