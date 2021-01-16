export class GameState {
  players: Player[] = [];
  spectators: string[] = [];
  stack: Card[] = [];
  turn = 0;
  started = false;
  direction = 1;
  cardQuantity = 1;
}

export class Player {
  hand: Card[] = [];
  constructor(public id: string) {}
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
