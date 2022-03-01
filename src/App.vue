<template>
<div class="page-wrapper with-navbar">
    <!-- Navbar (immediate child of the page wrapper) -->
    <nav class="navbar justify-content-between">
      <!-- Navbar content (with toggle sidebar button) -->
      <div class="navbar-content">
        <button class="btn btn-action" type="button">
          <i class="fa fa-bars" aria-hidden="true"></i>
          <span class="sr-only">Toggle sidebar</span> <!-- sr-only = show only on screen readers -->
        </button>
      </div>
      <div class="navbar-content">
        <h4 class="navbar-text text-monoXspace m-5">INSTRU
          <img alt="Vue logo" src="./assets/instrupella.svg" width="40">
          PELLA
        </h4>
      </div>
      <div class="navbar-content">
        <ul class="navbar-nav d-none d-md-flex"> <!-- d-none = display: none, d-md-flex = display: flex on medium screens and up (width > 768px) -->
          <li class="nav-item active">
            <a href="#" class="nav-link">Link 1</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">Link 2</a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Content wrapper -->
    <div class="content-wrapper">
      <InstruPella />
    </div>
  </div>
</template>

<script setup>
import InstruPella from './components/InstruPella.vue'
// window.halfmoon = require('halfmoon/js/halfmoon.min.js')
window.halfmoon = require('halfmoon')
</script>

<style lang="scss">
@import "halfmoon/css/halfmoon-variables.min.css";

:root {
  --large-button-height: 5rem;
}
</style>
