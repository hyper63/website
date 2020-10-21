<script>
  import { scale } from 'svelte/transition'
  export let open = false;

  function modalAction(node) {
    let fns = []
    if (document.body.style.overflow !== 'hiddent') {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      fns = [...fns, () => document.body.style.overflow = original]
    }
    return {
      destroy: () => fns.map(fn => fn())
    }
  }

</script>
{#if open}
<div class="modal" use:modalAction>
  <section>
    <aside in:scale out:scale={{duration: 500}}>
      <slot />
    </aside>
  </section>
</div>
{/if}
<style>
  section {
    height: 100%;
    display: grid;
    place-items: center;
  }
  aside {
    background-color: white;
  }
  .modal {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.8);
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }
</style>
