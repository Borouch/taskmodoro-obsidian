<script>
	import { options } from './../Graphics.ts';
</script>
<div class="options-icon-wrapper">
    {@html options}
</div>
<style>
    .options-icon-wrapper{
        margin-right:36px;
    }
:global(.options-icon){
    width: 24px;
    height: auto;;
}
:global(.options-icon circle){
    stroke: var(--secondary-action-item);

}
</style>