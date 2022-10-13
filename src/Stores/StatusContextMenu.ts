import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export const statusCtxMenuAbsPos: Writable<{ x: number; y: number }> =
    writable();
