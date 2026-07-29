# El Octágono

Gestor de torneos de Counter-Strike 2 para armar llaves entre amigos. Sitio estático, sin build ni dependencias — hosteado en GitHub Pages.

## Páginas públicas

- `index.html` — landing principal.
- `duelos-view.html` / `duos-view.html` / `pug-view.html` — vistas de solo lectura, se actualizan en vivo vía Firebase.
- `historial.html` / `ranking.html` — resultados y tabla de posiciones.
- `inscripcion.html` / `quienes-somos.html` / `terminos.html` — páginas informativas.

La administración de torneos (creación, sorteo de equipos, avance de resultados) vive en páginas separadas, sin enlazar desde la navegación pública y marcadas `noindex`. El acceso de escritura a Firebase está restringido por reglas de la base de datos a una única cuenta autorizada; los detalles de esas páginas y su autenticación no se documentan aquí.

## Modos

- **Duelos**: 1 vs 1. Soporta 2, 3 o 4 jugadores:
  - 2 jugadores → serie al mejor de 3.
  - 3 jugadores → todos contra todos, posiciones por victorias.
  - 4 jugadores → semifinales + final, con partido por el 3er puesto entre los perdedores.
- **Duos**: equipos de 2 jugadores. Mismo soporte de 2/3/4 equipos y formatos que Duelos.
- **Pug**: 2 equipos de hasta 5 jugadores cada uno, siempre asignados a mano (permite equipos disparejos, ej. 5v3). Serie al mejor de X partidas (1/3/5/7).

Los nombres de equipo se sortean del pool Alfa / Bravo / Charlie / Delta / Echo / Fox / Omega / Lambda / Gamma / Zeta / Sigma y son editables después de crear el torneo. Duelos y Duos pueden sortear automáticamente o asignar manualmente; Pug siempre es manual.

## Vista pública en vivo

El estado de cada torneo se guarda en Firebase Realtime Database; las páginas `*-view.html` lo leen en vivo sin necesidad de login. Las reglas de la base de datos permiten lectura pública; la escritura está restringida a una cuenta autorizada.

## Desarrollo local

No requiere instalación. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000/index.html`.
