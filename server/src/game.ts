import cors from 'cors';
import express from 'express';
import { Server as HttpServer } from 'http';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';
import { Card, cardSuits, cardValues, GameState, Player } from '../../server/src/types';

export class GameServer {
  public static readonly port: number = parseInt(process.env.PORT || '8080');
  app: express.Application = express();
  server: HttpServer = new HttpServer(this.app);
  io: Server = new Server(this.server, {
    cors:
      process.env.NODE_ENV === 'development'
        ? {
            origin: 'http://localhost:8081',
          }
        : undefined,
  });

  state: Map<string, GameState> = new Map();

  // get game from player
  getGameIdFromPlayerId(id: string): string | undefined {
    const games = this.state.entries();
    for (const [id, game] of games) {
      if (game.players.some(player => player.id === id)) return id;
    }
    return undefined;
  }

  constructor() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`player ${socket.id} joined`);

      // spectator attempts to join a room
      socket.on('room-spectate', ({ id }: { id: string }) => {
        const game: GameState | undefined = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Spectate join: invalid room code' });
        game.spectators.push(socket.id);
        socket.emit('room-spectate', { id, game });
      });

      // player attempts to join a room
      socket.on('room-connect', ({ id }: { id: string }) => {
        let game: GameState | undefined = this.state.get(id);
        if (!game) {
          game = new GameState();
          this.state.set(id, game);
        }
        if (!game.started && game.players.length < 4) {
          game.players.push(new Player(socket.id));
          socket.emit('room-connect', { id, game });
        } else {
          game.spectators.push(socket.id);
          socket.emit('room-spectate', { id, game });
        }
      });

      socket.on('input', (id: string, cards: Card, number?: number) => {
        const game = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Card input: invalid room code' });
        if (game.players[game.turn].id != socket.id) return;
        // todo do stuff!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      });

      // player leaves
      socket.on('disconnect', () => {
        console.log(`player ${socket.id} left`);
        const gameId = this.getGameIdFromPlayerId(socket.id);
        if (!gameId) return;
        const game = this.state.get(gameId);
        if (!game) return;
        game.players = game.players.filter(player => player.id !== socket.id);
        // remove the game if no more players are in it
        if (game.players.length === 0) {
          this.state.delete(gameId);
        }
      });
    });

    // dev only - allow requests from snowpack dev server
    process.env.NODE_ENV === 'development' && this.app.use(cors());

    // room code generator
    this.app.get('/api/generate-room-code', (req, res) => {
      let code = nanoid(16);
      // if codealready exists, regenerate i
      while (Array.from(this.state.keys()).includes(code)) code = nanoid(16);
      res.json({ code });
    });

    // quick join urls - https://example.com/join/aaaabbbb
    this.app.get('/join/:code', (req, res) => {
      const code = req.params.code;
      // TODO
    });

    this.app.get('/', (req, res) => {
      res.send('OK');
    });

    this.listen();
  }

  listen(): Promise<void> {
    return new Promise<void>(resolve => {
      this.server.listen(GameServer.port, () => resolve());
    });
  }

  deal(id: string): void {
    if (!this.state.has(id)) {
      throw new Error('Invalid game code: ' + id);
    }

    let cards: Card[] = [];
    for (const value of cardValues) {
      for (const suit of cardSuits) {
        cards.push({ suit, value });
      }
    }
    cards = _.shuffle(cards);

    // iterate over all cards, then give the card to a different player each time
    for (let i = 0; i < cards.length; i++) {
      this.state.get(id)!.players[i % this.state[id].players.length].hand.push(cards[i]);
    }
  }
}
