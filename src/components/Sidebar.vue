<template>
  <aside class="sidebar">
    <h1 class="title">NOC System</h1>
    <nav>
      <router-link to="/" class="link">Registro de Ponto</router-link>
      <router-link to="/passagem" class="link">Passagem de Turno</router-link>
      <router-link to="/escala" class="link">Escala</router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #1e2a38;
  color: white;
  padding: 20px;
  height: 100vh;
}
.title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.link:hover {
  background-color: #2f4054;
}
</style>
