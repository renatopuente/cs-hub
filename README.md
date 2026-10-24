# El Octágono

Gestor de torneos de Counter-Strike 2 para armar llaves entre amigos. Sitio estático, sin build ni dependencias, hosteado en GitHub Pages.

## Páginas públicas

- `index.html`: landing principal.
- `duelos-view.html` / `duos-view.html` / `pug-view.html`: vistas de solo lectura, se actualizan en vivo vía Firebase.
- `historial.html` / `ranking.html`: resultados y tabla de posiciones.
- `inscripcion.html` / `quienes-somos.html` / `terminos.html`: páginas informativas.

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

## Versionado

El sitio sigue versionado semántico (`vMAJOR.MINOR.PATCH`), mostrado al final de cada página pública. Versión actual: **v3.4.0**.

- **MAJOR**: un sistema o capacidad completamente nueva para la plataforma.
- **MINOR**: features o secciones nuevas dentro de la versión actual (una página nueva, un flujo nuevo, etc.).
- **PATCH**: ajustes, correcciones de copy, estilos o comportamiento sobre lo ya existente.

Al desplegar un cambio que amerite subir de versión, actualiza el número en el marcador de "vX.Y.Z" al final de cada página pública (`index.html`, `duelos-view.html`, `duos-view.html`, `pug-view.html`, `historial.html`, `ranking.html`, `inscripcion.html`, `quienes-somos.html`, `terminos.html`, `perfil.html`) y anota el cambio aquí:

- **v1.0.0**: primera versión pública. Torneos (Duelos/Duos/Pug), inscripción con niveles de precio, ranking por puntos ponderados por torneo, historial, y páginas informativas.
- **v2.0.0**: sistema de gestión de usuarios. Login de jugadores con Google (`js/player-auth.js`), página de perfil (`perfil.html`) con Nickname editable (bloqueado 2 temporadas tras cada cambio), flujo de inscripción ligado a la cuenta del jugador con dashboard de admin (`inscripciones.html`) separando solicitudes vs inscritos, y countdown de torneo agendado con revelado progresivo de jugadores confirmados.
- **v3.0.0**: multi-admin (`js/admin-config.js`, mapa de UIDs con vinculación de cuentas GitHub/Google), ID único visible por torneo con admin creador (`tournamentId`/`createdBy`), opción de empate en las series, pestaña "Mis torneos" en el perfil, inscripción directa (sin WhatsApp) al torneo Amistoso, y el sistema nuevo de **Comunidad**: los jugadores buscan y agregan amigos, y arman sus propios torneos (Duelos/Duos/Pug, públicos por ahora) invitando gente a unirse a un cupo — el admin sigue siendo quien inicia, marca resultados y finaliza cada torneo real, pero ahora puede recoger el roster armado por los jugadores desde su propio panel en vez de armarlo a mano.
- **v3.1.0**: rediseño de la portada (`index.html`, con su propio `css/home.css` y `js/home-live.js`): ficha del torneo con la franja en los tonos de la gema de la temporada, tablero en vivo "La arena ahora" con el estado de Duelos/Duos/Pug desde Firebase (en curso, programado con cuenta regresiva o último campeón), modos como menú, carta de los fundadores, valores de inscripción como ticket, preguntas frecuentes a la vista y barra con efecto vidrio. Las demás páginas siguen con `css/style.css` hasta su rediseño.
- **v3.2.0**: rediseño del resto del sitio con el lenguaje de la portada: `css/theme.css` común (colores, Switzer, botones, barra y menús con vidrio, pie, franja de la temporada) y `css/style.css` reescrita para las páginas internas y de administración, con vidrio en el campeón, el marcador y el podio sobre el arte de la temporada. `js/season-tone.js` reparte por temporada los tonos de la gema, el arte sin texto (`SEASON_ART`) y las escenas del hero de la portada (`SEASON_SCENES`, en `img/seasons/`). Logo nuevo (la cabeza del pulpo es el octágono) en `img/logos/` e íconos de la app en `img/icons/`. Leyenda de Manhattan Amethyst con dos crípticos jugables (`js/lore-cipher.js`): la ciudad y la gema de la temporada siguiente, con casillas, pistas de significado, indicador, materiales y letras, rendirse y resultado para compartir; las frases se escriben en `CRYPTICS` (`js/season-lore.js`), ya listas hasta Marrakech Jade. Clip de Dust2 1.6 en "Hecho por jugadores".
- **v3.2.1**: las temporadas pasan al español (Manhattan Amatista, Ibiza Topacio, Osaka Rubí…; `SEASON_CITIES` y `SEASON_GEMS` en `js/seasons.js`, y `getSeasonInfo` ahora trae `city` y `gem` aparte), con los crípticos reescritos para las respuestas en español. Los nombres son solo para mostrar: los registros se asignan a una temporada por fecha. Borde de gema en `css/theme.css`: un filo fino en los tonos de la gema de la temporada sobre botones, tarjetas y secciones, que sigue las esquinas cortadas y da una vuelta de brillo al pasar el puntero.
- **v3.2.2**: Viena pasa a llevar Diamante, una gema más conocida, y Ópalo pasa a Milán (jul–sep 2028). El críptico de la gema del final de Osaka Rubí ahora esconde DIAMANTE.
- **v3.3.0**: cintas de la temporada en la portada (`js/season-marquee.js`): arriba el nombre y las fechas, abajo el cierre, los días que faltan y cuándo empieza la siguiente (sin nombrarla, porque es la respuesta de los crípticos), en dos tonos de la gema, una con los tonos al revés. Imágenes nuevas de los modos (`img/modos/`, el mismo pulpo operador en las tres, con transparencia), cuya columna acompaña el scroll. En inscripción, el Amistoso dice «Inscribirme ahora» y los torneos pagos «Pagar ahora». Escenas y arte de Osaka Rubí, Viena Diamante y Miami Granate en `SEASON_SCENES` y `SEASON_ART`.
- **v3.4.0**: aviso «Reconectando…» en las vistas en vivo cuando se corta la conexión con Firebase (`js/live-connection.js`, nodo `.info/connected`). Leyendas de las cuatro temporadas de 2027 en `js/season-lore.js`. Vinculación de cuentas Google ↔ GitHub arreglada (`credentialFromError`; el otro proveedor es fijo porque `fetchSignInMethodsForEmail` devuelve vacío con la protección contra enumeración de correos; el panel no cierra la sesión a mitad de vincular). Las cintas de la portada corren siempre. Preguntas frecuentes, inscripción y términos al día: precio por jugador, Amistoso directo, pago por WhatsApp con QR de Deuna.

## Desarrollo local

No requiere instalación. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000/index.html`.
