import cors from 'cors';
import express from 'express';
import { Server as HttpServer } from 'http';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';
import { Card, cardSuits, cardValues, GameState, Player } from '../../frontend/src/data';

export class GameServer {
  public static readonly port: number = parseInt(process.env.PORT || '8080');
  app: express.Application = express();
  server: HttpServer = new HttpServer(this.app);
  io: Server = new Server(this.server, {
    cors: process.env.NODE_ENV === 'development' ? { origin: 'http://localhost:8081' } : undefined,
  });

  state: Map<string, GameState> = new Map();

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

      socket.on('room-create', ({ name }: { name?: string }) => {
        let id = nanoid(4);
        // if code already in use, regenerate it
        while (Array.from(this.state.keys()).includes(id)) id = nanoid(4);
        this.state.set(id, new GameState());
        const game = this.state.get(id)!;
        game.players = [new Player(socket.id, name)];
        socket.emit('room-connect', { id, game });
      });

      // player attempts to join a room
      socket.on('room-connect', ({ id, name }: { id: string; name?: string }) => {
        const game: GameState | undefined = this.state.get(id);
        // if game doesnt exist, send err
        if (!game) return socket.emit('error', { error: 'Room connect: invalid room code' });
        if (!game.started && game.players.length < 4) {
          game.players.push(new Player(socket.id, name));
          socket.emit('room-connect', { id, game });
          socket.join(id);
          console.log(socket.rooms);
        } else {
          game.spectators.push(socket.id);
          socket.emit('room-spectate', { id, game });
        }
      });

      socket.on('room-start', () => {
        const id = socket.rooms.keys()[0];
        const game = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Room start: invalid room code' });
        game.started = true;
        this.deal(id);
      });

      socket.on('input', ({ cards, flush }: { cards: Card[]; flush?: boolean }) => {
        console.log(socket.rooms.keys());
        const id = socket.rooms.keys()[0];
        const game = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Card input: invalid room code' });
        if (game.players[game.turn].id != socket.id && !flush) return;

        // if the cards you play aren't all the same type, return err
        if (cards.some(c => c.value !== cards[0].value))
          return socket.emit('error', { error: 'stop hacking n00b' });

        // if you are flushing, check top cards and see if they match yours
        if (flush) {
          const top = game.stack.slice(game.stack.length - cards.length, game.stack.length);
          if (top.some(c => c.value !== cards[0].value))
            return socket.emit('error', { error: 'stop hacking n00b' });
          return this.flush(id);
        }

        // if the number of cards you played doesn't match the number of cards being played, return err
        if (cards.length != game.cardQuantity)
          return socket.emit('error', { error: 'stop hacking n00b' });

        // if you play a 2, flush
        if (cards[0].value == '2') return this.flush(id);

        // add cards to stack
        game.stack.push(...cards);

        // if top card matches your cards, either flush or reverse turn order
        if (cards[0].value == game.stack[game.stack.length].value) {
          // flush if top 4 cards are same
          if (game.stack.slice(game.stack.length - 4).some(c => c.value !== cards[0].value))
            return this.flush(id);
          // reverse order
          this.emitToRoom(id, 'reverse', this.state);
          game.order *= -1;
        }
        this.advanceTurn(id);
      });

      // player leaves
      socket.on('disconnect', () => {
        console.log(`player ${socket.id} left`);
        const gameId = this.getGameIdFromPlayerId(socket.id);
        if (!gameId) return;
        const game = this.state.get(gameId);
        if (!game) return;
        game.players = game.players.filter(player => player.id !== socket.id);
        game.spectators = game.spectators.filter(id => id !== socket.id);
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
      let id = nanoid(16);
      // if codealready exists, regenerate i
      while (Array.from(this.state.keys()).includes(id)) id = nanoid(16);
      res.json({ id });
    });

    // quick join urls - https://example.com/join/aaaabbbb
    // this.app.get('/join/:code', (req, res) => {
    //   const code = req.params.code;
    // TODO
    // });

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

  // get game from player
  getGameIdFromPlayerId(id: string): string | undefined {
    const games = this.state.entries();
    for (const [gameId, game] of games) {
      if (game.players.some(player => player.id === id)) return gameId;
    }
    return undefined;
  }

  // emit event to a room
  emitToRoom(id: string, event: string, ...args: any[]): void {
    this.io.to(id).emit(event, ...args);
  }

  // deal cards to players in a game
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

  // clear stack and emit flush
  flush(id: string): void {
    const game = this.state.get(id);
    if (!game) return;
    game.stack = [];
    this.emitToRoom(id, 'flush');
    this.emitToRoom(id, 'update', this.state);
  }

  // change turn number and emit update
  advanceTurn(id: string): void {
    const game = this.state.get(id);
    if (!game) return;
    // if turn is the first player and order is negative, turn should be last player
    if (game.turn == 0 && game.order == -1) game.turn = game.players.length - 1;
    // if turn is the last player and order is positive, turn should be first player
    else if (game.turn == game.players.length - 1 && game.order == 1) game.turn = 0;
    // otherwise just add order
    else game.turn += game.order;
    this.emitToRoom(id, 'update', this.state);
  }
}
