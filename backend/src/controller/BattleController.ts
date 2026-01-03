import { Router, Request, Response } from 'express';
import { BattleService } from '../service/BattleService';

export class BattleController {
  public router = Router();
  private service = new BattleService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/start', this.startBattle);
    this.router.post('/attack', this.playerAttack);
    this.router.post('/cpu-attack', this.cpuAttack);
    this.router.get('/:sessionId', this.getBattleState);
    this.router.post('/reward', this.reward);
    this.router.post('/next', this.next);
    this.router.patch('/finish', this.finishSession);
  }

  private startBattle = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const session = await this.service.startBattle(sessionId);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private playerAttack = async (req: Request, res: Response) => {
    try {
      const { sessionId, moveIndex } = req.body;
      const session = await this.service.playerAttack(sessionId, moveIndex);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private cpuAttack = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const session = await this.service.cpuAttack(sessionId);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private getBattleState = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await this.service.getBattleState(sessionId);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private reward = async (req: Request, res: Response) => {
    try {
      const { sessionId, loseIndex, cpuIndex } = req.body;
      const session = await this.service.applyReward(sessionId, Number(loseIndex), Number(cpuIndex));
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private next = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const session = await this.service.nextBattle(sessionId);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private finishSession = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const session = await this.service.finishSession(sessionId, 'VICTORY');
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

}
