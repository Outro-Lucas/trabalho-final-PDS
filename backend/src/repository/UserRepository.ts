import { AppDataSource } from '../database/data-source';
import { User } from '../entity/User';

export class UserRepository {
  private repository = AppDataSource.getRepository(User);

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }
}
