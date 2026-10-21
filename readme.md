## Weather CLI APP

El objetivo de esta aplicación es que creemos una aplicación de consola que pida que ingresemos la ciudad, Al final, generaremos un binario ejecutable.

### Opciones:

- Ingresar el nombre de una ciudad.
- Guardar la ciudad por defecto.
- Registrar varias otras ciudades para buscar el clima en esas otras ciudades.

## Stack

- Bun.js
- OpenMeteo

## Ejemplo de petición http:

1. Paso 1: Geocoding API.
2. Paso 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Inicializar proyecto

```bash
bun init
```

### Estructura del proyecto

```bash
src/
├── actions/                # Acciones principales que puede ejecutar el usuario
│   ├── getWeather.ts       # Clima actual de la ciudad default y de todas
│   ├── addCity.ts          # Agregar una ciudad a la lista
│   ├── removeCity.ts       # Eliminar una ciudad
│   ├── setDefaultCity.ts   # Establecer la ciudad por defecto
│   ├── listCities.ts       # Listar todas las ciudades guardadas
│   └── toggleUnits.ts      # Cambiar entre °C y °F
├── presentation/           # Todo lo relacionado con la interacción de consola/CLI
│   ├── menu.ts             # Renderizado del menú y manejo de selección de opciones
│   ├── output.ts           # Funciones para mostrar mensajes al usuario
│   └── input.ts            # Funciones para capturar y validar inputs del usuario
├── storage/                # Capa para leer, escribir y gestionar datos locales
│   ├── configStorage.ts    # Lectura/escritura de ~/.weather-cli.json
│   ├── citiesStorage.ts    # Persistencia de ciudades guardadas
│   └── settingsStorage.ts  # Persistencia de configuración y preferencias
├── types/                  # Tipos y contratos TypeScript usados globalmente
│   ├── City.ts             # Definición de tipo City
│   ├── Weather.ts          # Tipos para la respuesta del clima
│   ├── Geocoding.ts        # Tipos para la respuesta del geocoding
│   ├── Config.ts           # Formato del archivo de configuración
│   └── MenuOption.ts       # Tipo para las opciones del menú
├── api/                    # Integración con APIs externas (OpenMeteo, geocoding)
│   ├── geocoding.ts        # Lógica para obtener coordenadas de una ciudad
│   └── weather.ts          # Lógica para obtener el clima actual
├── utils/                  # Utilidades y helpers reutilizables
│   ├── format.ts           # Formateadores de datos (ciudad, temperatura)
│   ├── constants.ts        # Constantes generales de la app
│   └── colors.ts           # Definición y utilidades de colores para la consola
└── index.ts                # Punto de entrada principal de la app CLI
index.ts                    # Launcher: ejecuta main() de src/index.ts
```

La configuración se guarda en `~/.weather-cli.json` y se accede siempre a través de `src/storage/`.
La variable de entorno `WEATHER_CLI_CONFIG_PATH` permite usar otra ruta (la usan los tests para no tocar el archivo real).

### Tests

```bash
bun test        # ejecuta la suite
bun run verify  # tests + typecheck (es el gate)
```

La app **no se ejecuta si los tests fallan**: los scripts `start`, `dev` y `build` ejecutan `bun run verify` antes de arrancar
(hooks `pre<script>` de Bun) y abortan con código de salida ≠ 0. Para compilar el binario:

```bash
bun run build   # compila ./weather solo si la suite está en verde
```

La suite vive en `tests/` y usa `bun:test` sin dependencias extra. Un archivo por módulo, siguiendo `src/`:

```bash
tests/
├── helpers/        # Utilidades de test (stdin, fetch, consola, config temporal)
├── utils/          # colors, format, constants
├── api/            # geocoding, weather
├── storage/        # configStorage, citiesStorage, settingsStorage
├── presentation/   # input, output, menu
├── actions/        # getWeather, addCity, removeCity, setDefaultCity, listCities, toggleUnits
└── index.test.ts   # main()
```

### Ejemplo del menú
Esta es la apariencia que deseamos crear

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5
```