# Guía de Instalación - Frontend Supermercado

## Paso 1: Crear el Proyecto Angular

Abre una terminal en `d:\blumblit\front-end` y ejecuta:

```bash
npx @angular/cli@latest new supermercado-app --routing --style=css --skip-git --standalone --directory=.
```

Cuando te pregunte sobre SSR (Server-Side Rendering), responde **No** (N).

Espera a que se instalen todas las dependencias (puede tomar varios minutos).

---

## Paso 2: Instalar TailwindCSS

Una vez creado el proyecto, instala TailwindCSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

---

## Paso 3: Configurar TailwindCSS

### 3.1 Editar `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
    },
  },
  plugins: [],
}
```

### 3.2 Editar `src/styles.css`:

Reemplaza todo el contenido con:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
```

---

## Paso 4: Instalar Dependencias Adicionales

```bash
npm install lucide-angular
```

---

## Paso 5: Verificar que Funciona

Ejecuta el servidor de desarrollo:

```bash
npm start
```

Abre tu navegador en `http://localhost:4200` - deberías ver la página de bienvenida de Angular.
