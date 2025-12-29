import { Router, Request, Response } from 'express';
import { BattleService } from '../service/BattleService';

export class BattleController {
  public router = Router();
  private service = new BattleService();

  constructor() {
    this.router.post('/start', this.startBattle);
    this.router.post('/attack', this.attack);
  }

  private startBattle = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const state = await this.service.startBattle(sessionId);
      res.json(state);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private attack = async (req: Request, res: Response) => {
    try {
      const { sessionId, move } = req.body;
      const result = await this.service.playerAttack(sessionId, move);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };
}
