import { User } from '../entity/User';
import { UserRepository } from '../repository/UserRepository';

export class UserService {
  private repository = new UserRepository();

  async createUser(nickname: string): Promise<User> {
    const user = new User();
    user.nickname = nickname;

    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }
}
