import express, { Application } from 'express';
import { UserController } from '../controller/UserController';
import { BattleController } from '../controller/BattleController';
import { SessionController } from '../controller/SessionController';
import cors from 'cors';

export function createServer(): Application {
  const app = express();

  app.use(cors());

  app.use(express.json());

  app.use('/users', new UserController().router);
  app.use('/sessions', new SessionController().router);
  app.use('/battle', new BattleController().router);

  return app;
}
