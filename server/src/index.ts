import dotenv from 'dotenv';
import path from 'path';
import { GameServer } from './game';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const game = new GameServer();
