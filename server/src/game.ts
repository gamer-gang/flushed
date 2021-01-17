import cors from 'cors';
import express from 'express';
import { globalAgent, Server as HttpServer } from 'http';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { Server, Socket } from 'socket.io';
import { Card, cardSuits, cardValues, GameState, Player, Bot } from '../../frontend/src/types';

const hierarchy = Array.from(_.clone(cardValues)).reverse();
hierarchy.push(hierarchy.shift()!);

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
      socket.onAny((...args: any[]) => {
        const [event] = args;
        console.log(`<-- ${event} ${socket.id}`);
      });

      console.log(`<-- connection ${socket.id}`);

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
        game.players = [];
        socket.emit('room-create', { id });
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
          this.emitToRoom(id, 'update', game);
        } else {
          game.spectators.push(socket.id);
          socket.emit('room-spectate', { id, game });
        }
      });

      socket.on('room-start', () => {
        const id = this.getGameIdFromPlayerId(socket.id);
        if (!id) return socket.emit('error', { error: 'Room start: invalid room code' });
        const game = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Room start: invalid room code' });
        while (game.players.length < 4) {
          game.players.push(new Bot(`Computer ${game.players.length + 1}`));
        }
        game.started = true;
        this.deal(id);
        for (const [index, player] of game.players.entries()) {
          if (player.hand.some(card => card.value === '3' && card.suit === 'spade')) {
            game.turn = index;
            break;
          }
        }
        this.emitToRoom(id, 'room-start', game);
        if (game.players[game.turn] instanceof Bot) this.makeBotMove(game.players[game.turn].id);
      });

      socket.on(
        'input',
        ({ cards, flush, pass }: { cards: Card[]; flush?: boolean; pass?: boolean }) => {
          console.log(socket.rooms.values());
          console.log(cards);
          const id = Array.from(socket.rooms.values())[1];
          const game = this.state.get(id);

          if (!game) return socket.emit('error', { error: 'Card input: invalid room code' });
          if (game.players[game.turn].id != socket.id && !flush) return;

          const player = game.players.find(player => player.id === socket.id)!;

          if (pass) {
            game.passes++;
            this.advanceTurn(id);
            return this.emitToRoom(id, 'update', game);
          }

          // if the cards you play aren't all the same type, return err
          if (cards.some(c => c.value !== cards[0].value))
            return socket.emit('error', { error: 'Illegal move' });

          // if card value is less than top, return err
          if (
            hierarchy.indexOf(cards[0].value) <
            hierarchy.indexOf(game.stack[game.stack.length - 1]?.value)
          )
            return socket.emit('error', { error: 'Illegal move' });

          // if you are flushing, check top cards and see if they match yours
          if (flush) {
            const top = game.stack.slice(game.stack.length - cards.length, game.stack.length);
            if (top.some(c => c.value !== cards[0].value))
              return socket.emit('error', { error: 'Illegal move' });
            return this.flush(id);
          }

          // if stack is empty, you should be able to set cardquantity
          if (!game.stack.length) {
            game.cardQuantity = cards.length;
          }

          // take last 4 cards in stack - number of cards you play, then see if they are all the same
          const top4 = [...game.stack.slice(game.stack.length - (5 - cards.length)), ...cards];
          if (top4.length === 4 && top4.every(card => card.value === top4[0].value))
            return this.flush(id);

          // if the number of cards you played doesn't match the number of cards being played, return err
          if (cards.length !== game.cardQuantity)
            return socket.emit('error', { error: 'Illegal move' });

          // take cards out of your hand that you played
          for (const card of cards) {
            console.log(card);
            const index = player.hand.findIndex(
              ({ suit, value }) => suit === card.suit && value === card.value
            );
            console.log('removing ' + index);
            player.hand.splice(index, 1);
          }

          // if you play a 2, flush
          if (cards[0].value === '2') return this.flush(id);

          // add cards to stack
          game.stack.push(...cards);

          // if top card matches your cards, either flush or reverse turn order
          if (cards[0].value === game.stack[game.stack.length - 1].value) {
            // flush if top 4 cards are same
            const top = game.stack.slice(game.stack.length - 5);
            if (top.length === 4 && top.every(c => c.value === cards[0].value))
              return this.flush(id);
            // reverse order
            this.emitToRoom(id, 'reverse', this.state);
            game.order *= -1;
          }
          this.advanceTurn(id);
        }
      );

      socket.on('update', ({ id }: { id: string }) => {
        const game = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Room leave: invalid room code' });
        socket.emit('update', game);
      });

      socket.on('room-leave', ({ id }: { id: string }) => {
        const game = this.state.get(id);
        if (!game) return socket.emit('error', { error: 'Room leave: invalid room code' });
        socket.leave(id);
        console.log(`<-- room-leave ${socket.id}`);
        game.players = game.players.filter(player => player.id !== socket.id);
        if (game.players.length == 0) this.state.delete(id);
      });

      // player leaves
      socket.on('disconnect', () => {
        console.log(`<-- disconnect ${socket.id}`);
        const gameId = this.getGameIdFromPlayerId(socket.id);
        if (!gameId) return;
        socket.leave(gameId);
        const game = this.state.get(gameId);
        if (!game) return;
        game.players = game.players.filter(player => player.id !== socket.id);
        game.spectators = game.spectators.filter(id => id !== socket.id);
        this.emitToRoom(gameId, 'update', game);
        // remove the game if no more players are in it
        if (game.players.filter(player => !player.id.startsWith('bot-')).length === 0) {
          this.state.delete(gameId);
        }
      });
    });

    // dev only - allow requests from snowpack dev server
    process.env.NODE_ENV === 'development' && this.app.use(cors());

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
    this.state.get(id)?.spectators.forEach(spec => this.io.to(spec).emit(event, ...args));
  }

  // deal cards to players in a game
  deal(id: string): void {
    if (!this.state.has(id)) {
      throw new Error('Invalid game code: ' + id);
    }

    const game = this.state.get(id)!;

    let cards: Card[] = [];
    for (const value of cardValues) {
      for (const suit of cardSuits) {
        cards.push({ suit, value });
      }
    }
    cards = _.shuffle(cards);

    // iterate over all cards, then give the card to a different player each time
    for (let i = 0; i < cards.length; i++) {
      game.players[i % game.players.length].hand.push(cards[i]);
    }

    const values = Array.from(_.clone(cardValues)).reverse();
    values.push(values.shift()!);

    // sort each player's hand (bubble sort)
    for (const player of game.players) {
      let swapped: boolean;
      do {
        swapped = false;
        for (let i = 0; i < player.hand.length - 1; i++) {
          if (values.indexOf(player.hand[i].value) > values.indexOf(player.hand[i + 1].value)) {
            [player.hand[i], player.hand[i + 1]] = [player.hand[i + 1], player.hand[i]];
            swapped = true;
          }
        }
      } while (swapped);
    }
  }

  // clear stack and emit flush
  flush(id: string): void {
    const game = this.state.get(id);
    if (!game) return;
    game.stack = [];
    this.emitToRoom(id, 'flush');
    this.emitToRoom(id, 'update', game);
    if (game.players[game.turn] instanceof Bot) {
      this.makeBotMove(game.players[game.turn].id);
    }
  }

  // change turn number and emit update
  advanceTurn(id: string): void {
    const game = this.state.get(id);
    if (!game) return;
    // if you have no cards left, you win!
    if (!game.players[game.turn].hand.length) {
      this.emitToRoom(id, 'update', game);
      return this.emitToRoom(id, 'winner');
    }
    // if turn is the first player and order is negative, turn should be last player
    if (game.turn == 0 && game.order == -1) game.turn = game.players.length - 1;
    // if turn is the last player and order is positive, turn should be first player
    else if (game.turn == game.players.length - 1 && game.order == 1) game.turn = 0;
    // otherwise just add order
    else game.turn += game.order;

    this.emitToRoom(id, 'update', game);

    // if 3 ppl pass, you should flush
    if (game.passes === 3) {
      game.passes = 0;
      this.flush(id);
    }

    if (game.players[game.turn] instanceof Bot) {
      this.makeBotMove(game.players[game.turn].id);
    }
  }

  // given a botid, make the bot move
  makeBotMove(id: string): any {
    const gameId = this.getGameIdFromPlayerId(id)!;
    console.log(`${gameId}: bot ${id} is trying to make turn`);
    const game = this.state.get(gameId);
    if (!game) return console.log('Bot error: game not exist!!!');
    const bot = game.players.find(player => player.id == id);
    if (!bot) return console.log('Bot error: id wronk');
    // bot decides to give up if theres doubles/triples
    if (game.cardQuantity > 1) {
      game.passes++;
      return setTimeout(() => this.advanceTurn(gameId), 1000);
    }

    const values = Array.from(_.clone(cardValues)).reverse();
    values.push(values.shift()!);

    for (const [index, card] of bot.hand.entries()) {
      if (
        game.stack.length &&
        values.indexOf(card.value) < values.indexOf(game.stack[game.stack.length - 1].value)
      )
        continue;
      console.log(`bot trying to play ${JSON.stringify(card)}`);
      bot.hand.splice(index, 1);
      game.stack.push(card);
      break;
    }
    if (game.stack[game.stack.length - 1]?.value == '2') setTimeout(() => this.flush(gameId), 1000);
    else setTimeout(() => this.advanceTurn(gameId), 1000);
  }
}
