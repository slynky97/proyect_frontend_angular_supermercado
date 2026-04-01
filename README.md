# 🛒 SupermercadoApp - Frontend

Este es el proyecto frontend para la aplicación de gestión de supermercados e inventarios. Ha sido generado y desarrollado utilizando [Angular CLI](https://github.com/angular/angular-cli) versión 21.0.0.

## 📋 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu entorno local:
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Angular CLI](https://angular.dev/tools/cli) (se instala globalmente usando el comando `npm install -g @angular/cli`)

## 🚀 Instalación

1. Posiciónate en la carpeta raíz del proyecto (`front-end`).
2. Instala todas las dependencias necesarias ejecutando:

```bash
npm install
```

## 🛠️ Servidor de Desarrollo

Para iniciar la aplicación en tu entorno local y ver los cambios en tiempo real:

1. Ejecuta el siguiente comando:
   ```bash
   ng serve
   ```
2. Abre tu navegador web y dirígete a `http://localhost:4200/`.

*La aplicación se recargará automáticamente cada vez que guardes modificaciones en los archivos fuente de tu código.*

## 📦 Construcción (Build) para Producción

Para compilar el proyecto y prepararlo para un entorno de producción o despliegue:

```bash
ng build
```
Esto compilará la aplicación y almacenará los archivos optimizados dentro de la carpeta `dist/`. La configuración por defecto optimiza tu aplicación para asegurar el máximo rendimiento y menor tiempo de carga al usuario final.

## 🏗️ Generación de Código (Scaffolding)

Angular CLI incluye potentes herramientas para generar rápidamente estructuras de código. Para crear un nuevo componente, ejecuta:

```bash
ng generate component nombre-del-componente
```

*Nota: También puedes generar otros elementos como `services`, `directives` o `pipes`. Para ver todas las opciones disponibles, ejecuta `ng generate --help`.*

## 🧪 Pruebas (Testing)

**Pruebas Unitarias**  
Para ejecutar las pruebas unitarias usando `Karma`, utiliza el siguiente comando:
```bash
ng test
```

**Pruebas End-to-End (e2e)**  
Para ejecutar las pruebas de integración (requiere haber configurado previamente un framework de e2e):
```bash
ng e2e
```

---
*Para obtener más información sobre los comandos, visita la [Documentación Oficial de Angular CLI](https://angular.dev/tools/cli).*
