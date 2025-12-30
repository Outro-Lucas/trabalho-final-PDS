import { Router, Request, Response } from 'express';
import { BattleService } from '../service/BattleService';

export class BattleController {
  public router = Router();
  private service = new BattleService();

  constructor() {
    this.router.post('/start', this.startBattle);
    this.router.post('/attack', this.playerAttack);
    this.router.post('/cpu-attack', this.cpuAttack);
    this.router.post('/switch', this.switchPokemon);
    this.router.post('/continue', this.continueBattle);
    this.router.get('/:sessionId', this.getState);
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

  private playerAttack = async (req: Request, res: Response) => {
    try {
      const { sessionId, moveIndex } = req.body;
      const state = await this.service.playerAttack(sessionId, moveIndex);
      res.json(state);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private cpuAttack = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const state = await this.service.cpuAttack(sessionId);
      res.json(state);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private switchPokemon = async (req: Request, res: Response) => {
    try {
      const { sessionId, newIndex } = req.body;
      const state = await this.service.switchPokemon(sessionId, newIndex);
      res.json(state);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private continueBattle = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      const state = await this.service.continueBattle(sessionId);
      res.json(state);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private getState = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const state = await this.service.getState(sessionId);
      res.json(state);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  };
}
