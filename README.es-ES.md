# 📷 img-toolkit

Una librería para redimensionar y editar imágenes.

Demo: https://2yh02.github.io/img-toolkit

## Tabla de Contenidos

- [Características](#features)
- [Instalación](#installation)
- [Uso](#usage)
- [Funciones](#functions)
- [Opciones](#options)
- [Valores por Defecto y Validación de Entrada](#defaults-and-input-validation)
- [Política de Manejo de Errores](#error-handling-policy)
- [Comportamiento de la Calidad](#quality-behavior)
- [Comparativa de Calidad](#quality-comparison)
- [Configuración de Vite para WASM](#vite-setup-for-wasm)
- [Licencia](#license)
- [Autor](#author)

## Características

- ⚡ **Rápido y Eficiente**: Impulsado por Rust y WebAssembly.
- 📸 **Soporta formatos JPEG, PNG, WebP**.
- 📐 **Redimensionamiento** con manejo automático de la relación de aspecto.
- 🎚️ **Ajuste de brillo y contraste** fácilmente.
- ✂️ **Recorte de Imágenes**: Extrae regiones específicas dinámicamente.
- 🔄 **Rotar y Voltear**: Rotación de 90/180/270 grados y espejo horizontal/vertical.
- 🎨 **Filtros Creativos**: Desenfoque gaussiano y conversión a escala de grises.
- 🔍 **Múltiples filtros de remuestreo** (Nearest, Triangle, CatmullRom, Gaussian, Lanczos3).

## Instalación

Para instalar la librería, puedes usar npm o yarn:

```bash
npm install img-toolkit
yarn add img-toolkit
```

## Uso

### Nueva API (recomendado)

```javascript
import {
  processImage,
  resize,
  convertFormat,
  adjustBrightness,
} from "img-toolkit";

const resized = await resize(file, { width: 800, resampling: 4 });
const brighter = await adjustBrightness(file, { brightness: 0.6 });
const converted = await convertFormat(file, { format: "webp", quality: 0.8 });

const processed = await processImage(file, {
  width: 800,
  height: 600,
  quality: 0.8,
  format: "jpg",
  brightness: 0.5,
  resampling: 2,
  rotate: 90,
  flip: "horizontal",
  cropX: 10,
  cropY: 10,
  cropW: 400,
  cropH: 300,
  contrast: 0.2,
  blur: 1.5,
  grayscale: true,
});
```

### API Heredada (obsoleta en 2.x)

```javascript
import { resizeImage } from "img-toolkit";

const file = // tu archivo de imagen
const output = await resizeImage(file, {
  width: 800,
  height: 600,
  quality: 0.8,
  format: "jpg",
  brightness: 0.5,
  resampling: 2,
});
```

`resizeImage(file, options)` todavía es compatible en `2.x` y será eliminado en `3.0.0`.

## Funciones

```javascript
processImage(file: File, options: ProcessImageOptions): Promise<File>
resize(file: File, options: ResizeOnlyOptions): Promise<File>
convertFormat(file: File, options: ConvertFormatOptions): Promise<File>
adjustBrightness(file: File, options: BrightnessOptions): Promise<File>
```

## Opciones

### `ProcessImageOptions`

| Opción       | Tipo   | Descripción                                                                                                                                                                 |
| ------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `width`      | number | (Opcional) Ancho objetivo en píxeles. Si se omite, el ancho se ajusta automáticamente.                                                                             |
| `height`     | number | (Opcional) Alto objetivo en píxeles. Si se omite, el alto se ajusta automáticamente.                                                                               |
| `quality`    | number | (Opcional) 0.0 a 1.0. Efectivo para salida JPEG y WebP. Por defecto `0.7`. Los valores no finitos (ej. `NaN`) se sanitizan al valor por defecto.                      |
| `format`     | string | Formato de salida (`"jpg"`, `"png"`, `"webp"`).                                                                                                                    |
| `brightness` | number | (Opcional) 0.0 a 1.0. Por defecto `0.5`.                                                                                                                                 |
| `resampling` | number | (Opcional) 0 a 10. Por defecto `4`.                                                                                                                                     |
| `rotate`     | number | (Opcional) Ángulo de rotación (`90`, `180`, `270`).                                                                                                                    |
| `flip`       | string | (Opcional) Dirección del volteo (`"horizontal"`, `"vertical"`, `"both"`).                                                                                           |
| `cropX`      | number | (Opcional) Coordenada X del cuadro delimitador para el recorte.                                                                                                        |
| `cropY`      | number | (Opcional) Coordenada Y del cuadro delimitador para el recorte.                                                                                                        |
| `cropW`      | number | (Opcional) Ancho del cuadro delimitador para el recorte. (Tanto `cropW` como `cropH` deben ser > 0 para aplicarse).                                                    |
| `cropH`      | number | (Opcional) Alto del cuadro delimitador para el recorte. (Tanto `cropW` como `cropH` deben ser > 0 para aplicarse).                                                  |
| `contrast`   | number | (Opcional) Factor de ajuste de contraste de `-1.0` a `1.0` (`0.0` es neutro/sin cambios).                                                                               |
| `blur`       | number | (Opcional) Valor sigma del desenfoque gaussiano.                                                                                                                     |
| `grayscale`  | boolean| (Opcional) Convierte la imagen a escala de grises si es `true`.                                                                                                          |

### `ResizeOnlyOptions`

| Opción       | Tipo   | Descripción                                                                                                                                  |
| ------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `width`      | number | (Opcional) Ancho objetivo en píxeles.                                                                                                        |
| `height`     | number | (Opcional) Alto objetivo en píxeles.                                                                                                       |
| `resampling` | number | (Opcional) 0 a 10. Por defecto 4.                                                                                                               |
| `quality`    | number | (Opcional) 0.0 a 1.0. Efectivo si la fuente es JPEG. Por defecto `0.7`. Los valores no finitos se sanitizan al valor por defecto. |

### `ConvertFormatOptions`

| Opción    | Tipo   | Descripción                                                                                                                                  |
| --------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `format`  | string | Formato de salida (`"jpg"`, `"png"`, `"webp"`).                                                                                                 |
| `quality` | number | (Opcional) 0.0 a 1.0. Efectivo para salida JPEG y WebP. Por defecto `0.7`. Los valores no finitos se sanitizan al valor por defecto. |

### `BrightnessOptions`

| Opción       | Tipo   | Descripción                                                                                                                            |
| ------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `brightness` | number | 0.0 a 1.0. Por defecto `0.5`. Los valores no finitos se sanitizan al valor por defecto.                                                      |
| `quality`    | number | (Opcional) 0.0 a 1.0. Efectivo si la fuente es JPEG.                                                                                           |

## Valores por Defecto y Validación de Entrada

- `quality` tiene un valor por defecto de `0.7` cuando se omite.
- `brightness` tiene un valor por defecto de `0.5` cuando se omite.
- `resampling` tiene un valor por defecto de `4` cuando se omite.
- `quality` y `brightness` se limitan a rangos válidos (`0.0..1.0`), y los valores no finitos como `NaN` / `Infinity` se sanitizan a valores seguros por defecto.
- `resampling` se limita a `0..10`, y los valores no finitos se sanitizan al valor por defecto.

## Política de Manejo de Errores

- Los errores dirigidos al usuario son intencionalmente genéricos y seguros para contextos de cliente.
- Los detalles internos del codificador/decodificador de bajo nivel se registran internamente y no se devuelven directamente a los consumidores de la API.
- Los mensajes típicos para el usuario incluyen:
  - `Invalid options`
  - `Unsupported format`
  - `Image processing failed`

## Comportamiento de la Calidad

- Salida `jpg`: se aplica `quality`.
- Salida `png`: no se aplica `quality` (codificación PNG sin pérdida).
- Salida `webp`: se aplica `quality` a través del codificador WebP con pérdida nativo del navegador.

## Comparativa de Calidad

A continuación se muestra una comparativa simple de calidad visual/tamaño de archivo utilizando la misma imagen de origen.

| Variante | Tamaño |
| --- | --- |
| Original | 747 KB |
| Salida de JavaScript Canvas API | 49.3 KB |
| Salida de Rust/WASM (`img-toolkit`) | 41.3 KB |

### Original

![Original wolf image](./docs/assets/quality/wolf.jpg)

### Salida de JavaScript Canvas API

![Canvas API output](./docs/assets/quality/wolf.js.jpg)

### Salida de Rust/WASM

![Rust WASM output](./docs/assets/quality/wolf.rust.jpg)

## Configuración de Vite para WASM

Para usar img-toolkit con Vite, debes desactivar la pre-optimización del paquete para evitar problemas de carga de WebAssembly:

### vite.config.js

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["img-toolkit"],
  },
});
```

Sin esta configuración, Vite puede intentar pre-empaquetar img-toolkit y romper la resolución del módulo WASM.
Esto asegura que WebAssembly se cargue correctamente en tiempo de ejecución a través de `import()` dinámico.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## Autor

Creado por 2YH02.
