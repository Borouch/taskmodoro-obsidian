<script lang="ts">
  export let title: string;
  let isSelected = false;
</script>

<div
  on:click
  on:mouseenter={() => {
    isSelected = true;
  }}
  on:mouseleave={() => {
    isSelected = false;
  }}
  class="menu-item {isSelected ? 'selected' : ''} "
>
  <div class="menu-item-icon">
    <slot />
  </div>
  <div class="menu-item-title">{title}</div>
</div>

<style>
  :global(.menu-item-icon .check-mark-icon) {
    width: 16px;
    height: 16px;

    fill: var(--text-faint);
  }

  :global(.menu-item-icon .close-icon path) {
    fill: var(--text-faint);
  }

  :global(.selected .menu-item-icon .check-mark-icon, .selected
      .menu-item-icon
      .close-icon
      path) {
    fill: var(--status-fill);
  }

  :global(.menu-item-icon .close-icon) {
    width: 12px;
    height: 12px;
  }

  .menu-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .menu-item-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    padding-bottom: 4px;
    padding-right: 8px;
    height: 16px;
  }
</style>
