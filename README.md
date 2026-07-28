# El Octágono

Gestor de torneos de Counter-Strike 2 para armar llaves entre amigos. Sitio estático, sin build ni dependencias — hosteado en GitHub Pages.

## Páginas

- `index.html` — landing pública: acceso a las vistas en vivo de los tres modos.
- `admin.html` — mini landing privada (no enlazada públicamente) con acceso directo a los tres paneles de administración.
- `duelos.html` / `duos.html` / `pug.html` — paneles de administración (crear torneo, sortear/asignar equipos, avanzar ganadores).
- `duelos-view.html` / `duos-view.html` / `pug-view.html` — vistas públicas de solo lectura, se actualizan en vivo vía Firebase mientras el admin juega.

## Modos

- **Duelos**: 1 vs 1. Soporta 2, 3 o 4 jugadores:
  - 2 jugadores → serie al mejor de 3.
  - 3 jugadores → todos contra todos, posiciones por victorias.
  - 4 jugadores → semifinales + final, con partido por el 3er puesto entre los perdedores.
- **Duos**: equipos de 2 jugadores. Mismo soporte de 2/3/4 equipos y formatos que Duelos.
- **Pug**: 2 equipos de hasta 5 jugadores cada uno, siempre asignados a mano (permite equipos disparejos, ej. 5v3). Serie al mejor de X partidas (1/3/5/7).

Los nombres de equipo se sortean del pool Alfa / Bravo / Charlie / Delta / Echo / Fox / Omega / Lambda / Gamma / Zeta / Sigma y son editables después de crear el torneo. Duelos y Duos pueden sortear automáticamente o asignar manualmente; Pug siempre es manual.

## Vista pública en vivo

Los paneles admin escriben el estado del torneo a Firebase Realtime Database (proyecto `cs-hub-6e388`); las páginas `*-view.html` lo leen en vivo sin necesidad de login. Reglas de la base de datos: lectura pública, escritura solo autenticada (anónimo, desde el panel admin).

## Desarrollo local

No requiere instalación. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000/index.html`.
