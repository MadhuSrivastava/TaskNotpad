<template>
  <Header/>
  <main class="container">
    <router-view />
  </main>
</template>

<script setup>
import Header from './components/Header.vue'
</script>

<style>
/* optional global styles */
</style>
