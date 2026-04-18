# Calendario Histórico

Aplicación web full-stack que permite seleccionar cualquier fecha del pasado y obtener una noticia histórica resumida de ese día, generada por un modelo de inteligencia artificial.

---

## Funcionalidades

- **Selector de fecha**: input de tipo `date` que solo permite fechas anteriores al día actual.
- **Noticia histórica con IA**: al elegir una fecha, el backend consulta un modelo de IA y devuelve una noticia real y resumida (máx. 500 caracteres) ocurrida ese día.
- **Loader global**: overlay animado que bloquea la UI mientras se espera la respuesta.
- **Diseño responsivo**: la interfaz se adapta correctamente a pantallas móviles y escritorio.

---

## Estructura del proyecto

```
CALENDARIO-NOTICIA/
├── docker-compose.yml               # Orquestación de servicios
├── dockerhub-push.sh                # Script para construir y subir imágenes a Docker Hub
├── frontend/
│   ├── Dockerfile                   # Imagen Docker del frontend (nginx)
│   ├── nginx.conf                   # Configuración de nginx
│   ├── docker-entrypoint.sh         # Script que inyecta variables de entorno al arrancar
│   ├── index.html                   # Interfaz principal
│   └── assets/
│       ├── css/
│       │   └── styles.css           # Estilos de toda la aplicación
│       └── js/
│           ├── config.js            # Variable API_URL (valor por defecto local)
│           └── main.js              # Lógica del frontend (vanilla JS)
└── backend/
    ├── Dockerfile                   # Imagen Docker del backend (Node.js)
    ├── server.js                    # Servidor Express con endpoint de IA
    ├── package.json                 # Dependencias del backend
    ├── .env.example                 # Variables de entorno de referencia
    └── .dockerignore                # Exclusiones del contexto Docker
```

---

## Tecnologías

| Capa                 | Tecnología / Librería                                 | Versión    |
|----------------------|-------------------------------------------------------|------------|
| Frontend             | HTML5, CSS3, JavaScript (ES6+)                        | —          |
| Backend              | Node.js + Express                                     | Express ^5 |
| IA                   | OpenAI SDK (compatible con cualquier API OpenAI-like) | ^6.9       |
| Variables            | dotenv                                                | ^17        |
| CORS                 | cors                                                  | ^2.8       |
| Contenedor frontend  | nginx                                                 | alpine     |
| Contenedor backend   | Node.js                                               | 22-alpine  |
| UI — loader          | JsLoadingOverlay                                      | ^1.2 (CDN) |
| Tipografía           | Montserrat (Google Fonts)                             | CDN        |
| Iconos               | Font Awesome                                          | 6.1 (CDN)  |

---

## Frontend

### `frontend/index.html`
Página única con un formulario que contiene:
- **Label + input de fecha**: selector que bloquea la fecha de hoy y fechas futuras.
- **Caja de noticias**: muestra el mensaje inicial o la noticia retornada por la IA.

Carga los scripts en este orden: `config.js` → `main.js` → librerías CDN.

### `frontend/assets/js/config.js`
Define la variable global `API_URL` usada por `main.js` para apuntar al backend. En desarrollo local tiene el valor por defecto `http://localhost:3000`. En Docker, el archivo es sobreescrito al arrancar el contenedor con el valor de la variable de entorno `API_URL`.

```js
const API_URL = "http://localhost:3000";
```

### `frontend/assets/js/main.js`
Toda la lógica corre en el evento `load` de la ventana.

| Función / bloque         | Descripción                                                                                        |
|--------------------------|----------------------------------------------------------------------------------------------------|
| Seteo de `dateInput.max` | Calcula la fecha de hoy en hora local (evita el desfase UTC) y la asigna como máximo seleccionable. |
| Listener `change`        | Al cambiar la fecha: valida que sea anterior a hoy, llama al backend y muestra la noticia.         |
| `fetch POST /calendar`   | Envía `{ day, month, year }` al backend y renderiza la respuesta en el contenedor de noticias.     |
| `loader(state)`          | Muestra u oculta el overlay de carga global usando JsLoadingOverlay.                               |

---

## Backend

### `backend/server.js`
Servidor Express que expone un único endpoint REST.

#### `POST /calendar`

Recibe el día, mes y año seleccionados y devuelve una noticia histórica generada por IA.

**Request body:**
```json
{ "day": 3, "month": 4, "year": 1990 }
```

**Respuesta exitosa `200`:**
```json
{ "text": "noticia resumida generada por el modelo..." }
```

**Errores:**

| Código | Motivo                                              |
|--------|-----------------------------------------------------|
| `400`  | Falta alguno de los campos `day`, `month` o `year`. |
| `500`  | Error al comunicarse con la API del modelo de IA.   |

**Prompt usado:**
> "Dime una noticia resumida de máximo 500 caracteres sobre algo que pasó el día `{day}` del mes `{month}` del año `{year}`. Tienes que retornar algo, investiga y busca cosas que pasaron. No hagas instrucciones, ni formalismo, ni preguntas, ni nada que haga ver que eres una IA. Esto no es un chatbot, solo requiero una noticia de ese día."

---

## Configuración de variables de entorno

### Backend — `backend/.env`

Crea el archivo basándote en `backend/.env.example`:

```env
API_KEY=tu_api_key
API_URL=https://api.openai.com/v1/
MODEL=gpt-4o-mini
```

| Variable  | Descripción                                                |
|-----------|------------------------------------------------------------|
| `API_KEY` | Clave de autenticación de la API                           |
| `API_URL` | URL base de la API (compatible con el estándar OpenAI)     |
| `MODEL`   | Identificador del modelo a usar (ej: `gpt-4o-mini`, `gpt-4o`) |

### Frontend — variable `API_URL`

Controla a qué URL apunta el frontend para llamar al backend.

| Contexto         | Valor                                                      |
|------------------|------------------------------------------------------------|
| Desarrollo local | `http://localhost:3000` (definido en `config.js`)          |
| Docker Compose   | Variable `API_URL` en el servicio `frontend`               |
| Railway / cloud  | Variable de entorno configurada en el panel del servicio   |

---

## Docker

### Imágenes en Docker Hub

| Servicio  | Imagen                                           |
|-----------|--------------------------------------------------|
| Backend   | `bandres28/calendario-noticia-backend:latest`    |
| Frontend  | `bandres28/calendario-noticia-frontend:latest`   |

### Archivos Docker

#### `frontend/Dockerfile` (nginx:alpine)
1. Copia todo el contenido de `frontend/` al directorio raíz de nginx.
2. Copia `nginx.conf` como configuración por defecto.
3. Copia y ejecuta `docker-entrypoint.sh` antes de iniciar nginx.

#### `frontend/docker-entrypoint.sh`
Al arrancar el contenedor, genera `config.js` con el valor de `$API_URL` (si no está definida, usa `http://localhost:3000` como valor por defecto):

```sh
cat > /usr/share/nginx/html/assets/js/config.js <<EOF
const API_URL = "${API_URL:-http://localhost:3000}";
EOF
```

#### `backend/Dockerfile` (Node.js 22-alpine)
1. Instala solo dependencias de producción (`--omit=dev`).
2. Copia `server.js`.
3. Expone el puerto `3000`.

#### `docker-compose.yml`

```yaml
services:
  backend:
    image: bandres28/calendario-noticia-backend:latest
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env

  frontend:
    image: bandres28/calendario-noticia-frontend:latest
    ports:
      - "8080:80"
    environment:
      - API_URL=http://localhost:3000
    depends_on:
      - backend
```

| Servicio | Puerto local           |
|----------|------------------------|
| Frontend | http://localhost:8080  |
| Backend  | http://localhost:3000  |

### Comandos Docker

```bash
# Levantar la aplicación
docker compose up

# Reconstruir imágenes tras cambios
docker compose build

# Construir y subir imágenes a Docker Hub
bash dockerhub-push.sh

# Con tag específico
bash dockerhub-push.sh v1.1.0
```

---

## Instalación sin Docker

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar el servidor
node server.js
# Servidor corriendo en http://localhost:3000
```

Luego abre `frontend/index.html` en el navegador (directamente o sirviéndolo desde XAMPP).

---

## Flujo de la aplicación

```
Usuario selecciona una fecha
        │
        ▼
  Validación: ¿es anterior a hoy?
        │
        ├── No → muestra mensaje informativo
        │
        └── Sí
              │
              ▼
        loader(true) → POST ${API_URL}/calendar { day, month, year }
              │
              ▼
        Backend construye prompt → API de IA → noticia resumida
              │
              ▼
        loader(false) → noticia se muestra en pantalla
```
