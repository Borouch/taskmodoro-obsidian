<script lang="ts">
  import { clickTargets } from './../Stores/ContextMenu';
  import { afterUpdate } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { isClickOutsideTargets } from '../Helpers/Helpers';

  export let classes: string = '';
  export let showCtxMenu: boolean;
  export let relativeEl: HTMLElement;
  export let alignX: 'left' | 'right' = 'right';
  export let ctxMenuAbsPosStore: Writable<{ x: number; y: number }>;
  let ctxMenuRelPos: { x: number; y: number } ;
  let alignedCtxMenuRelPos: { x: number; y: number };
  let contextMenuEl: HTMLElement;
  let menuWidth: number;

  afterUpdate(() => {
    if (menuWidth && alignX === 'left') {
      alignedCtxMenuRelPos.x = ctxMenuRelPos.x - menuWidth;
    }
  });

  $: {
    handleClickOutside(showCtxMenu);
  }

  const handleClickOutside = (_showTaskCtxMenu: boolean) => {
    if (_showTaskCtxMenu) {
      document.addEventListener('click', closeIfClickOutsideCallback);
    } else {
      document.removeEventListener('click', closeIfClickOutsideCallback);
    }
  };

  const closeIfClickOutsideCallback = (e: Event) => {
    const targets = [
      contextMenuEl,
      ...$clickTargets
    ]
    const isClickOutside = isClickOutsideTargets(e, targets);
    showCtxMenu = !isClickOutside;
  };

  ctxMenuAbsPosStore.subscribe((absPos: { x: number; y: number } | null) => {
    if (absPos && relativeEl) {
      var rect = relativeEl.getBoundingClientRect();
      const xRel = absPos.x - rect.left - 10;
      const yRel = absPos.y - rect.top + 15;
      ctxMenuRelPos = { x: xRel, y: yRel };
      alignedCtxMenuRelPos = ctxMenuRelPos;
      showCtxMenu = true;
    } else {
      showCtxMenu = false;
    }
  });
</script>

{#if showCtxMenu}
  <div
    bind:clientWidth={menuWidth}
    bind:this={contextMenuEl}
    class="${classes} menu"
    style={`top: ${alignedCtxMenuRelPos.y}px; left: ${alignedCtxMenuRelPos.x}px; `}
  >
    <slot />
  </div>
{/if}

<style>
  .menu {
    z-index: 5;
    position: absolute;
  }
</style>
