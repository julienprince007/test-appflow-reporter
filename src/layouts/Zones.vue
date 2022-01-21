<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title class="text-center q-pl-md">
          <span class="sw-title">{{ title }}</span>
        </q-toolbar-title>
      </q-toolbar>
      <q-btn
        class="absolute-left"
        flat
        @click="$router.go(-1)"
        icon="arrow_back_ios"
      />
    </q-header>
    <q-page-container>
      <router-view @title="setTitle" />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      title: ''
    }
  },
  methods: {
    setTitle(value) {
      this.title = value
    }
  },
  computed: {}
}
</script>
