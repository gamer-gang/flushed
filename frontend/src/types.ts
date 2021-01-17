import { nanoid } from 'nanoid';

export class Player {
  hand: Card[] = [];
  constructor(public id: string, public name = 'Player') {}
}

export class Bot {
  hand: Card[] = [];
  id: string;
  constructor(public name = 'Computer') {
    this.id = 'bot-' + nanoid();
  }
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

export const hierarchy = Array.from([...cardValues]).reverse();
hierarchy.push(hierarchy.shift()!);

export const cardSuits = ['club', 'diamond', 'heart', 'spade'] as const;

export type CardSuit = typeof cardSuits[number];
export type CardValue = typeof cardValues[number];

export class GameState {
  players: (Player | Bot)[] = [];
  spectators: string[] = [];
  stack: Card[] = [];
  turn = 0;
  started = false;
  direction = 1;
  cardQuantity = 1;
  order: -1 | 1 = 1;
  passes = 0;
  lastTurn = '';
}
