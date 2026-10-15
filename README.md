# Library Hub Frontend

![Licencia: sin definir](https://img.shields.io/badge/licencia-sin%20definir-lightgrey)
[![npm: 10.9.3](https://img.shields.io/badge/npm-10.9.3-CB3837?logo=npm)](https://docs.npmjs.com/cli/v10/)
[![Build de GitLab CI/CD: sin pipeline](https://img.shields.io/badge/build-sin%20pipeline-lightgrey?logo=gitlab)](https://gitlab.com/jala-university1/cohort-3/ES.CO.CSWB-366.GA.T2.26.M2/SC/victor-mamani/capstone/library-hub-frontend/-/pipelines?ref=main)

SPA para consultar libros y gestionar préstamos, reservas y lectura personal de una biblioteca universitaria. Usa React, TypeScript, Vite, React Router y CSS Modules.

Aplicación pública: [Library Hub en Netlify](https://library-hub-vm.netlify.app/).
API de producción: [salud de la API en Vercel](https://library-hub-api-mu.vercel.app/api/health).

## Funcionalidades

- Catálogo público, búsqueda, filtro opcional por autor y categorías.
- Tema claro/oscuro con selector de sol y luna, preferencia persistente en este navegador y colores adaptados en todas las vistas.
- Orden por relevancia, publicación y popularidad según registros de lectura de Open Library; Autor A–Z sobre una selección de hasta 200 obras, ordenada antes de paginar. La interfaz explica el límite cuando la consulta tiene más coincidencias.
- Préstamo, devolución, próximos vencimientos e historial persistente paginado.
- Reservas por orden de solicitud, prioridad para la primera persona y cancelación; sin caducidad automática.
- Seguimiento personal: lista de deseos, leyendo y completado; lista filtrable en Mi biblioteca y opción de quitar seguimiento.
- Perfil con foto privada, registro, login y logout; access token en memoria y renovación mediante cookie HttpOnly.

La disponibilidad representa un ejemplar académico por obra, separado de los metadatos externos. La lectura pertenece a cada cuenta y es independiente del préstamo. La interfaz conserva la consulta al volver del detalle y orienta el foco tras paginar o devolver libros.

Componentes propios y CSS Modules: tarjetas horizontales, dos columnas desde 980px, filtros desplegables y navegación inferior en móvil. No requiere Tailwind ni biblioteca de componentes.

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

### Pruebas con Jest y React Testing Library

Después de `npm ci`, ejecutar `npm test`. No requiere PostgreSQL ni una API en ejecución:
las solicitudes `fetch` se simulan y cada prueba restaura la sesión y el entorno.

El conjunto comprueba LoginPage, ProtectedRoute, BookCard, ActiveLoanRow, BookPage,
CatalogPage, ReadingStatus y LoansPage; los hooks useResource y useLogout; y el cliente HTTP. Las páginas de detalle
y préstamos comprueban también useBorrowBook y useLoans mediante sus interacciones.
Incluye registro/login, errores y reintento,
redirección tras el acceso, bloqueo de acciones pendientes, cancelación de consultas,
cabeceras Bearer, renovación concurrente, caducidad y logout. Las pruebas de login y
rutas protegidas conservan AuthProvider, React Router y el cliente HTTP reales.
Las pruebas de préstamos proporcionan un contexto autenticado y usan el cliente
HTTP real. Las respuestas de la red se simulan en todos los casos.

```bash
npm run test:watch
npm run test:coverage
```

Jest transforma TypeScript/JSX con Babel y ejecuta la interfaz en JSDOM. La construcción
con `tsc` comprueba también los tipos de las pruebas. Vite continúa compilando la aplicación.

### Flujo de autenticación

El registro y el login llaman a `/api/auth/register` y `/api/auth/login`. La API entrega
un JWT que el cliente conserva en memoria y envía como `Authorization: Bearer <token>`
en las solicitudes protegidas. No se almacenan tokens ni contraseñas en Local Storage.
La cookie de renovación es `HttpOnly`, `SameSite=Strict` y `Secure` en producción;
`credentials: 'include'` permite enviarla por el proxy `/api` del mismo origen.

AuthProvider recupera la sesión al iniciar la SPA. Ante un `401` protegido, el cliente
coordina una sola renovación y reintenta una vez. Si la renovación devuelve `401`,
elimina la sesión local; un error transitorio se comunica al usuario. El logout revoca
la sesión en el backend, elimina la cookie y después borra el JWT de memoria.
ProtectedRoute controla la navegación; la API autoriza los datos de cada usuario.

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

### Netlify

Importar `VictorMamani/library-hub-frontend` desde GitHub, rama `main`. `netlify.toml` establece Node.js 22, el comando `npm run build:netlify` y la carpeta de publicación `dist`.

En las variables del proyecto de Netlify, configurar `API_PROXY_TARGET` para la compilación con el origen HTTPS de producción de la API, por ejemplo `https://tu-api.vercel.app`, sin `/api` ni barra final. La compilación falla si falta la variable o su formato no es válido.

El script genera `dist/_redirects`: primero reenvía `/api/*` al mismo prefijo de la API y después sirve `index.html` para las rutas de React Router. El navegador sigue llamando a `/api` desde el origen del frontend, lo que permite usar la cookie de sesión existente. `API_PROXY_TARGET` es una dirección pública y no debe contener credenciales.

Configurar `APP_ORIGIN` en Vercel con el origen exacto del sitio de Netlify. Después de cambiar cualquiera de las variables, volver a desplegar el proyecto correspondiente. Los dominios de previews necesitan su propia configuración de origen; la configuración inicial corresponde al dominio estable de producción.

Verificar `/api/health`, el registro/login, la sesión después de recargar una ruta como `/loans` y el cierre de sesión desde el sitio publicado.

## Rendimiento de renderizado

Los borradores de búsqueda y autor viven en CatalogFilters. Escribir actualiza el formulario; consultar o paginar actualiza los resultados mediante useCatalog. El cambio de tema modifica variables CSS y el estado local del selector, sin guardar datos de sesión en Local Storage. No se requiere Redux para estos flujos.

Para comprobarlo, ejecutar el frontend en desarrollo y grabar las interacciones con React Developer Tools, pestaña Profiler: escribir sin enviar, buscar, paginar y cambiar el tema. StrictMode puede llamar dos veces a las funciones de render en desarrollo; esas llamadas no equivalen a dos actualizaciones confirmadas ni a dos cambios del DOM. La instrumentación de medición no forma parte del bundle del producto.
