import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Session } from '../entity/Session';
import { History } from '../entity/History';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [User, Session, History]
});
