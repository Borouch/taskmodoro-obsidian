import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { TaskStatus } from '../FileInterface';
import type { TaskDetails } from '../TaskDetails';

export const statusCtxMenuAbsPos: Writable<{ x: number; y: number }> =
  writable();

export const ctxMenuTd: Writable<TaskDetails> = writable();
