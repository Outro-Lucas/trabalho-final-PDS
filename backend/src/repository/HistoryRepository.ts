import { AppDataSource } from '../database/data-source';
import { History } from '../entity/History';

export class HistoryRepository {
  private repository = AppDataSource.getRepository(History);

  async save(history: History): Promise<History> {
    return this.repository.save(history);
  }
}
