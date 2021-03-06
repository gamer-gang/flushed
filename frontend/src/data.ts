import { writable } from 'svelte/store';
import type { GameState } from './types';

export const game = writable<GameState | undefined>(undefined);
export const gameId = writable<string | undefined>(undefined);
export const spectator = writable<boolean | undefined>(undefined);
