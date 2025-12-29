import { Router, Request, Response } from 'express';
import { SessionService } from '../service/SessionService';

export class SessionController {
  public router = Router();
  private service = new SessionService();

  constructor() {
    this.router.post('/', this.createSession);
    this.router.get('/:id', this.getSessionById);
    this.router.get('/:id/pokemons', this.getPokemons);
    this.router.post('/:id/team', this.defineTeam);
  }

  private createSession = async (req: Request, res: Response) => {
    try {
      const { userId, difficulty } = req.body;
      const session = await this.service.createSession(userId, difficulty);
      res.status(201).json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private getSessionById = async (req: Request, res: Response) => {
    try {
      const session = await this.service.getSessionById(req.params.id);
      res.json(session);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private getPokemons = async (req: Request, res: Response) => {
    try {
      const pokemons = await this.service.generatePokemons(req.params.id);
      res.json(pokemons);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  private defineTeam = async (req: Request, res: Response) => {
    try {
      await this.service.defineTeam(req.params.id, req.body.team);
      res.json({ message: 'Time definido com sucesso' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };
}
