<template>
  <div class="fixed-center text-center">
    <p class="text-faded">
      Page introuvable ...
      <strong>(404)</strong>
    </p>
    <q-btn color="secondary" style="width: 200px;" @click="$router.push('/')"
      >Retour</q-btn
    >
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
