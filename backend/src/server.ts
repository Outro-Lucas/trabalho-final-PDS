import 'reflect-metadata';
import { AppDataSource } from './database/data-source';
import { createServer } from './app/app';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  const app = createServer();

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

bootstrap();
