<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white text-primary">
      <q-toolbar>
        <q-toolbar-title class="text-center q-pt-xl">
          <img src="~assets/sowell-icon-blue.png" class="sw-brand-icon-login" />
          <span class="sw-brand-login">SoWell</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
