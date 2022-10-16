<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { isClickOutsideTargets } from '../Helpers/Helpers';
  export let classes: string = '';
  export let showCtxMenu: boolean;
  export let relativeEl: HTMLElement;
  export let ctxMenuAbsPosStore: Writable<{ x: number; y: number }>;
  let ctxMenuRelPos: { x: Number; y: Number };
  let contextMenuEl: HTMLElement;
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
    const isClickOutside = isClickOutsideTargets(e, [contextMenuEl]);
    showCtxMenu = !isClickOutside;
  };

  ctxMenuAbsPosStore.subscribe((absPos: { x: number; y: number } | null) => {
    if (absPos && relativeEl) {
      var rect = relativeEl.getBoundingClientRect();
      const xRel = absPos.x - rect.left - 10;
      const yRel = absPos.y - rect.top + 15;
      ctxMenuRelPos = { x: xRel, y: yRel };
      // statusCtxMenuRelPos = { x: xRel, y: yRel };
      showCtxMenu = true;
    } else {
      showCtxMenu = false;
    }
  });
</script>

{#if showCtxMenu}
  <div
    bind:this={contextMenuEl}
    class="${classes} menu"
    style={`top: ${ctxMenuRelPos.y}px; left: ${ctxMenuRelPos.x}px; `}
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
