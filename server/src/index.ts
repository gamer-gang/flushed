import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

(async () => {
  const { GameServer } = await import('./game');
  new GameServer();
})();
