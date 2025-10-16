export const pizzaStyles = `
:root { 
  color-scheme: dark;
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-card: #1a1a1a;
  --border-color: #222;
  --border-light: #2a2a2a;
  --text-primary: #eee;
  --text-secondary: #ccc;
  --text-muted: #999;
  --accent: #ff6b35;
  --accent-hover: #ff8555;
}

* { 
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body { 
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

/* Header */
header { 
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 24px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

header .brand { 
  font-weight: 900;
  font-size: 28px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

header nav {
  display: flex;
  gap: 24px;
  align-items: center;
}

header nav a { 
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  font-size: 15px;
}

header nav a:hover {
  color: var(--accent);
}

header .cta-button {
  background: var(--accent);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

header .cta-button:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

/* Hero Section */
#hero { 
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 80px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

#hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

#hero .hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

#hero h1 { 
  font-size: 56px;
  font-weight: 900;
  margin-bottom: 16px;
  line-height: 1.2;
  letter-spacing: -1px;
}

#hero .subtitle {
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

#hero .hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

#hero button, #hero .button {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

#hero .button-primary {
  background: var(--accent);
  color: white;
}

#hero .button-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

#hero .button-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-light);
}

#hero .button-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Main Content */
main { 
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 24px;
}

section {
  margin-bottom: 80px;
}

h2 { 
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 32px;
  text-align: center;
}

h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

/* Menu Grid */
#menu .grid { 
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.card { 
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card h3 {
  color: var(--text-primary);
  margin-bottom: 12px;
}

.card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  flex-grow: 1;
}

.card .price { 
  color: var(--accent);
  font-weight: 700;
  font-size: 24px;
}

.card .add-to-cart {
  margin-top: 16px;
  width: 100%;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card .add-to-cart:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  header {
    padding: 12px 16px;
  }

  header .brand {
    font-size: 24px;
  }

  header nav {
    gap: 12px;
  }

  header nav a {
    font-size: 14px;
  }

  #hero {
    padding: 60px 20px;
  }

  #hero h1 {
    font-size: 36px;
  }

  #hero .subtitle {
    font-size: 16px;
  }

  h2 {
    font-size: 28px;
  }

  main {
    padding: 40px 16px;
  }

  #menu .grid {
    grid-template-columns: 1fr;
  }
}
`;

