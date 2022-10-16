import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export const deletePopupCloseCallback: Writable<(() => void)|null> = writable(null);
