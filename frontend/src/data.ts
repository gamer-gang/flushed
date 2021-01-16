import { io } from 'socket.io-client';
import { writable } from 'svelte/store';

export const endpoint = import.meta.env.SNOWPACK_PUBLIC_API_URL;

export class Player {
  hand: Card[] = [];
  constructor(public id: string, public name = 'Player') {}
}

export interface Card {
  suit: CardSuit;
  value: CardValue;
}

export const cardValues = [
  'A',
  'K',
  'Q',
  'J',
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
] as const;

export const cardSuits = ['club', 'diamond', 'heart', 'spade'] as const;

export type CardSuit = typeof cardSuits[number];
export type CardValue = typeof cardValues[number];

export class GameState {
  players: Player[] = [];
  spectators: string[] = [];
  stack: Card[] = [];
  turn = 0;
  started = false;
  direction = 1;
  cardQuantity = 1;
  order: -1 | 1 = 1;
}

export const game = writable<GameState | undefined>(undefined);
export const gameId = writable<string | undefined>(undefined);
export const spectator = writable<boolean | undefined>(undefined);

export const socket = io(endpoint, { transports: ['websocket', 'polling'] });
