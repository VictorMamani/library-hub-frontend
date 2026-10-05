# Library Hub Frontend

![Licencia: sin definir](https://img.shields.io/badge/licencia-sin%20definir-lightgrey)
[![npm: 10.9.3](https://img.shields.io/badge/npm-10.9.3-CB3837?logo=npm)](https://docs.npmjs.com/cli/v10/)
[![Build de GitLab CI/CD: sin pipeline](https://img.shields.io/badge/build-sin%20pipeline-lightgrey?logo=gitlab)](https://gitlab.com/jala-university1/cohort-3/ES.CO.CSWB-366.GA.T2.26.M2/SC/victor-mamani/capstone/library-hub-frontend/-/pipelines?ref=main)

SPA para consultar libros y gestionar préstamos de una biblioteca universitaria. Usa React, TypeScript, Vite, React Router y CSS Modules.

## Desarrollo

Requiere Node.js 22 desde 22.13, o Node.js 24 o superior, y npm. Con la API disponible en el puerto 3001:

```bash
npm ci
npm run dev
```

Abrir `http://localhost:5180` en Brave. El servidor de Vite reenvía las solicitudes `/api` a `http://localhost:3001`. Para otro destino, configurar `API_PROXY_TARGET` a partir de `.env.example`.

El entorno completo se ejecuta desde el repositorio hermano `library-hub-api`:

```bash
npm run setup:dev
docker compose up -d --build
```

## Comprobaciones

```bash
npm run build
npm run lint
npm run format:check
npm test
```

## Formato y calidad del código

Prettier mantiene el formato de TypeScript, JSX, CSS, HTML y configuración. ESLint revisa JavaScript/TypeScript y las reglas de React. Ambos repositorios usan dos espacios, comillas simples, punto y coma y un ancho de referencia de 100 caracteres.

```bash
npm run format
npm run lint:fix
npm run check
```

`format` aplica el formato; `format:check` lo comprueba sin editar. `check` ejecuta formato, lint, compilación y pruebas. VS Code dispone de recomendaciones de extensiones y formato al guardar para los lenguajes del proyecto; instalar Prettier y ESLint desde esas recomendaciones. `.editorconfig` define indentación y finales de línea para otros editores compatibles.

El `.gitignore` excluye dependencias, compilaciones, cobertura, archivos locales de entorno y temporales. `.env.example`, los lockfiles y las configuraciones compartidas del editor se incluyen en el control de versiones.

## Funciones disponibles

Catálogo de Open Library con búsqueda, categorías y paginación; orden por relevancia y publicación; detalle de libro; registro, login y logout; préstamos activos, devolución e historial.

Las páginas de detalle, acceso, préstamos y cuenta se cargan de forma diferida. Las portadas tienen carga perezosa y alternativa cuando la fuente no entrega una imagen. La sesión se renueva mediante una cookie y los access tokens permanecen en memoria.

## Producción

`npm run build` genera `dist/`. Configurar fallback a `index.html` para las rutas SPA y un proxy `/api` hacia la API. El Dockerfile incluye una etapa `production` con Nginx que espera el servicio backend con el nombre de red `api` en el puerto 3001. El HTTPS se configura en la plataforma o proxy de entrada.

```bash
docker build --target production -t library-hub-frontend .
```

Las variables `VITE_*` se entregan al navegador y no deben contener secretos.
