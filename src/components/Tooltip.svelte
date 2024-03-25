<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let showtooltip1: boolean = false;
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-unknown-role -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="tooltip1"
  role="tooltip1"
  on:mouseover={() => showtooltip1 = true}
  on:mouseout={() => showtooltip1 = false}
  on:focusin={() => showtooltip1 = true}
  on:focusout={() => showtooltip1 = false} 
>
  <slot></slot>
  <span class="tooltip1text">
    <slot name="tooltip1Text"></slot>
  </span>
</div>

<style>
  .tooltip1 {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .tooltip1 .tooltip1text {
    visibility: hidden;
    width: max-content;
    background-color: #3e8b0a;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: calc(100% + 8px);
    left: 100%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .tooltip1:hover .tooltip1text,
  .tooltip1:focus-within .tooltip1text {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(-8px);
  }
</style>