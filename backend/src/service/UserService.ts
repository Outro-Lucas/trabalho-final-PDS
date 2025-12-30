import { User } from '../entity/User';
import { UserRepository } from '../repository/UserRepository';

export class UserService {
  private repository = new UserRepository();

  async createUser(nickname: string): Promise<User> {

    const existingUser = await this.findByNickname(nickname);
    if (existingUser) {
      throw new Error('Nickname ja esta em uso');
    }

    const user = new User();
    user.nickname = nickname;

    return this.repository.save(user);
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.repository.findByNickname(nickname);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }
}
