# El Octágono

Gestor de torneos de Counter-Strike 2 para armar llaves entre amigos. Sitio estático, sin build ni dependencias — hosteado en GitHub Pages.

## Páginas

- `index.html` — landing pública: acceso a las vistas en vivo de ambos modos.
- `admin.html` — mini landing privada (no enlazada públicamente) con acceso directo a ambos paneles de administración.
- `companero.html` / `4v4.html` — paneles de administración (crear torneo, sortear/asignar equipos, avanzar ganadores).
- `companero-view.html` / `equipos-view.html` — vistas públicas de solo lectura, se actualizan en vivo vía Firebase mientras el admin juega.

## Modos

- **Modo Compañero**: equipos de 2 jugadores. Soporta 2, 3 o 4 equipos:
  - 2 equipos → serie al mejor de 3.
  - 3 equipos → todos contra todos, posiciones por victorias.
  - 4 equipos → semifinales + final, con partido por el 3er puesto entre los perdedores.
- **Modo Equipos**: 2 equipos con tamaño configurable (3v3, 4v4 o 5v5). Serie al mejor de X partidas (1/3/5/7).

Los nombres de equipo se sortean del pool Alfa / Bravo / Charlie / Delta / Echo / Fox y son editables después de crear el torneo. En ambos modos se puede sortear automáticamente o asignar jugadores manualmente.

## Vista pública en vivo

Los paneles admin escriben el estado del torneo a Firebase Realtime Database (proyecto `cs-hub-6e388`); las páginas `*-view.html` lo leen en vivo sin necesidad de login. Reglas de la base de datos: lectura pública, escritura solo autenticada (anónimo, desde el panel admin).

## Desarrollo local

No requiere instalación. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000/index.html`.
