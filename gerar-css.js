const fs = require('fs');
const path = require('path');

const cssContent = `/* ==========================================================================
   ConectaPet - Estilo Global e Acessibilidade
   ========================================================================== */

:root {
  --primary-color: #2b6cb0;
  --primary-dark: #1a4971;
  --secondary-color: #319795;
  --accent-color: #dd6b20;
  --bg-color: #f7fafc;
  --card-bg: #ffffff;
  --text-color: #2d3748;
  --text-muted: #718096;
  --border-color: #e2e8f0;
  --success-color: #38a169;
  --warning-color: #d69e2e;
  --danger-color: #e53e3e;
  --radius: 8px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

body.high-contrast {
  --primary-color: #0000ff;
  --primary-dark: #000080;
  --secondary-color: #008080;
  --bg-color: #000000;
  --card-bg: #121212;
  --text-color: #ffffff;
  --text-muted: #cccccc;
  --border-color: #444444;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
}

a:focus, button:focus, input:focus, select:focus, textarea:focus {
  outline: 3px solid var(--accent-color);
  outline-offset: 2px;
}

header {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.navbar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: #ffffff;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: #ffffff;
}

main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #ffffff;
  padding: 3.5rem 2rem;
  border-radius: var(--radius);
  text-align: center;
  margin-bottom: 2.5rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 2rem auto;
  opacity: 0.95;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  text-align: center;
  box-shadow: var(--shadow);
}

.stat-number {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.card {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.badge-verified {
  background-color: #e6fffa;
  color: #234e52;
  border: 1px solid #b2f5ea;
}

.progress-bar-bg {
  background-color: var(--border-color);
  border-radius: 50px;
  height: 10px;
  width: 100%;
  margin: 0.8rem 0;
  overflow: hidden;
}

.progress-bar-fill {
  background-color: var(--secondary-color);
  height: 100%;
  width: 0%;
  transition: width 0.5s ease-in-out;
}

footer {
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
  padding: 2rem 1.5rem;
  text-align: center;
  margin-top: 4rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  .hero h1 {
    font-size: 1.8rem;
  }
}
`;

const cssPath = path.resolve(__dirname, 'frontend/css/style.css');
fs.writeFileSync(cssPath, cssContent, 'utf-8');
console.log('✅ Ficheiro frontend/css/style.css gerado com sucesso!');