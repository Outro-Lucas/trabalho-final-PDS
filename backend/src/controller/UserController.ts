import { Router, Request, Response } from 'express';
import { UserService } from '../service/UserService';

export class UserController {
  public router: Router = Router();
  private service = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', this.createUser.bind(this));
    this.router.get('/:id', this.findById.bind(this));
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    const { nickname } = req.body;

    if (!nickname) {
      res.status(400).json({ message: 'Nickname é obrigatório' });
      return;
    }

    const user = await this.service.createUser(nickname);
    res.status(201).json(user);
  }

  private async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await this.service.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  }
}
