# CS HUB

Gestor de torneos de Counter-Strike 2 para armar llaves entre amigos. Sitio estático, sin build ni dependencias — pensado para GitHub Pages.

## Modos

- **Modo Compañero** (`companero.html`): equipos de 2 jugadores. Soporta 2, 3 o 4 equipos:
  - 2 equipos → serie al mejor de 3.
  - 3 equipos → todos contra todos, posiciones por victorias.
  - 4 equipos → semifinales + final, con partido por el 3er puesto entre los perdedores.
- **Modo Equipos** (`4v4.html`): 2 equipos con tamaño configurable (3v3, 4v4 o 5v5). Serie al mejor de X partidas (1/3/5/7).

Los nombres de equipo se sortean del pool Alfa / Bravo / Charlie / Delta / Echo / Fox y son editables después de crear el torneo.

## Desarrollo local

No requiere instalación. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000/index.html`.
