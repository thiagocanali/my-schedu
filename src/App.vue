<template>
  <div class="app-container">
    <aside class="sidebar">
      <h1 class="logo">MySchedu</h1>

      <nav>
        <router-link to="/" class="nav-item" active-class="active">🕒 Registro</router-link>
        <router-link to="/passagem" class="nav-item" active-class="active">📋 Passagem</router-link>
        <router-link to="/escala" class="nav-item" active-class="active">📅 Escala</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #f5f6fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: #2f3640;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 3px 0 6px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  color: #dcdde1;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
  background: #353b48;
  color: white;
}

.active {
  background: #40739e;
  color: white;
}

/* Main content */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

@media (max-width: 700px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    flex-direction: row;
    width: 100%;
    height: 60px;
    align-items: center;
    justify-content: space-around;
  }

  nav {
    flex-direction: row;
    gap: 0;
  }

  .logo {
    display: none;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
