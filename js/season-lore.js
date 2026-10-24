// Leyenda/transfondo de cada temporada, para temporada-actual.html. Canon
// compartido: un pulpo gigante recorre ciudades del mundo escondiendo una
// gema distinta cada 3 meses — de ahí sale el nombre de cada temporada
// (ciudad + gema) que ya arma seasonName() en js/seasons.js. Se cuenta a
// modo de historieta: capítulos cortos, en dos partes, con dos crípticos de
// la temporada siguiente: la ciudad a la mitad y la gema al final. El último
// capítulo de cada parte prepara su críptico.
//
// Agrega una entrada nueva acá al arrancar cada temporada — la clave debe
// calzar EXACTO con el nombre que produce seasonName(index). heroArt es
// opcional (arte propio de esa temporada, ver img/seasons/). Si una
// temporada no tiene entrada todavía, se usa SEASON_LORE_FALLBACK. Los
// crípticos se escriben aparte, en CRYPTICS (más abajo).
const SEASON_LORE = {
  "Mónaco Esmeralda": {
    heroArt: "img/seasons/monaco.webp",
    tagline: "Una frecuencia pirata, un satélite que nadie reclama, y una cuenta regresiva verde que ya empezó.",
    part1: [
      {
        title: "I. La señal que nadie debía captar",
        text: "Ocurrió a las 3:14 de la madrugada, en un cuarto de control frente al puerto de Mónaco: un técnico de guardia sintonizó por accidente una frecuencia que no estaba en ningún registro. En la pantalla, entre líneas de estática, un temporizador verde corría hacia atrás. Nadie en la sala reconoció el protocolo. Todos reconocieron el sonido: el mismo pitido de una bomba plantada, sitio B, cuarenta segundos.",
      },
      {
        title: "II. Ocho monitores, una sola marca",
        text: "La señal no venía de un solo lugar. Venía de ocho, transmitiendo en simultáneo, cada una mostrando una partida distinta desde un ángulo que ninguna cámara oficial podía tener. En la esquina inferior de cada feed, la misma marca de agua: un pulpo de ocho tentáculos, cada uno conectado a un cable distinto, cada cable a un servidor que nadie había firmado.",
      },
      {
        title: "III. El color del temporizador",
        text: "Los ingenieros que lograron aislar un fragmento de la señal coincidieron en un detalle: el verde del contador no era el verde estándar de ningún HUD conocido. Era más profundo, casi mineral — el mismo verde, dirían después los que llegaron a jugar esa temporada, de una esmeralda cortada para reflejar la luz de una mira. Alguien, en algún reporte interno, ya la había bautizado: Mónaco Esmeralda.",
      },
      {
        title: "IV. Los que decodificaron las coordenadas",
        text: "Bastaron dos semanas para que la señal dejara de ser un rumor de ingenieros y se convirtiera en una dirección: una arena improvisada en la costa, sin nombre en ningún mapa turístico. Llegaron equipos que ya se conocían de otros torneos, y llegaron también nombres nuevos que nadie había visto competir antes. Todos traían la misma pregunta sin decirla en voz alta: ¿quién más descifró esto?",
      },
      {
        title: "V. El primer error de cálculo",
        text: "La primera baja de la temporada no fue una eliminación en el marcador. Fue un rotate mal calculado: un jugador dejó su sitio dos segundos antes de tiempo, confiado en que su compañero cubriría el hueco, y su compañero — por primera vez en meses — dudó. El round se perdió por eso. El equipo, poco después, también.",
      },
    ],
    part2: [
      {
        title: "VI. La economía no perdona",
        text: "Para el ecuador de la temporada, ya nadie jugaba solo por ganar la ronda: jugaba por sobrevivir a la siguiente. Un force-buy mal calculado podía dejar a un equipo entero sin rifles durante tres rounds seguidos, y en esa frecuencia, tres rounds sin rifles equivalían a tres semanas fuera de la tabla. Se ahorraba, se apostaba, se perdía. La señal seguía transmitiendo, indiferente.",
      },
      {
        title: "VII. Silencio de radio en sitio B",
        text: "Hubo una final regional en la que el equipo favorito cortó su propia comunicación interna durante los últimos diez segundos de un round decisivo — una jugada calculada para que el rival, que llevaba semanas interceptando su frecuencia, no escuchara el plan. Funcionó. Ganaron el sitio. Pero dos jugadores del equipo, los que ejecutaron la jugada a ciegas y en silencio, no volvieron a confiar del todo en el resto del roster.",
      },
      {
        title: "VIII. Lo que cuesta un clutch",
        text: "Los que llegaron a jugar un 1vs3 en esa frecuencia describen lo mismo después: el sonido de la propia respiración tapando el resto del audio, el temporizador verde en la esquina bajando más rápido de lo que debería ser posible, y una claridad extraña — como si el resto de la temporada, hasta ese punto, hubiera sido solo el entrenamiento para ese round exacto.",
      },
      {
        title: "IX. La última transmisión",
        text: "Cuando se acerca el final de la temporada, los ocho monitores empiezan a sincronizarse en un solo feed: la gran final. La marca del pulpo se queda fija en pantalla hasta el último disparo, y luego — siempre así, sin excepción — la señal se corta. No hay despedida, no hay créditos. Solo estática, y un nombre nuevo grabado en el historial.",
      },
      {
        title: "X. Sintoniza tu frecuencia",
        text: "Nadie ha logrado rastrear el origen real de la señal, ni por qué elige Mónaco esta vez, ni quién programó ese temporizador verde que ya está corriendo. Lo único seguro es que la próxima transmisión ya tiene fecha. La pregunta es si tu equipo va a estar del otro lado de la pantalla, o dentro de ella.",
      },
    ],
  },
  "Manhattan Amatista": {
    heroArt: "img/seasons/manhattan-arte.webp",
    tagline: "Un apagón en toda la isla, una sola torre encendida en morado y cristales que crecen donde nadie mira.",
    part1: [
      {
        title: "I. El apagón de las 3:14",
        text: "Tres meses después de que la señal se cortara en Mónaco, Manhattan se quedó a oscuras. A las 3:14 de la madrugada se apagó la isla entera, de Harlem a Battery Park, menos un edificio: el Empire State, encendido de arriba abajo en un morado que ningún ingeniero de la ciudad había programado. En las pantallas muertas de Times Square apareció, por un segundo, un temporizador del mismo color.",
      },
      {
        title: "II. Cristales en el metro",
        text: "Los primeros en verlos fueron los trabajadores de una línea de metro cerrada hace décadas. En las paredes del túnel crecían cristales de amatista, grandes como un rifle, y vibraban todos al mismo ritmo. El capataz grabó el sonido con su teléfono y lo subió esa misma noche. Medio internet lo reconoció en segundos: era el pitido de una bomba plantada, acelerando.",
      },
      {
        title: "III. La marca vuelve",
        text: "Cuando volvió la luz, ocho pantallas de Times Square mostraban la misma imagen: el pulpo de ocho tentáculos, ahora morado, enroscado alrededor de la aguja del Empire State. Cada tentáculo apuntaba a una azotea distinta de Midtown. Siete eran edificios abandonados. La octava tenía mesas, monitores y un cartel escrito a mano: la arena estaba lista.",
      },
      {
        title: "IV. Los que llegaron desde Mónaco",
        text: "Volvieron caras conocidas de la temporada pasada, ahora con rencores nuevos: dúos que habían ganado juntos llegaron en equipos rivales, y rivales de Mónaco llegaron compartiendo micrófono. Desde el Bronx y Brooklyn aparecieron nombres que nadie había visto competir. Todos coincidían en una sola regla no escrita: en esta frecuencia no se confía en las comunicaciones de nadie.",
      },
      {
        title: "V. Una frase en Times Square",
        text: "La primera eliminación de la temporada fue culpa de un smoke lanzado un segundo tarde sobre la entrada al sitio A. Pero lo que todos recuerdan de esa noche no es la ronda perdida. Cuando el humo se disipó, las ocho pantallas de Times Square dejaron de mostrar al pulpo y, durante un segundo, mostraron una frase que no tenía ningún sentido. Alguien la copió en el chat del torneo con una sola nota debajo: el pulpo nunca dice las cosas de frente.",
      },
    ],
    part2: [
      {
        title: "VI. La ciudad que nunca duerme",
        text: "A mitad de la temporada, Manhattan ya cobraba cada ronda. Los equipos ahorraban en bodegas de Brooklyn y jugaban rondas eco con lo justo, esperando el momento de comprar rifles para todos. Un force-buy a destiempo podía hundir a un equipo durante tres rondas seguidas. Los cristales del metro, decían los que bajaban a verlos, brillaban un poco más cada vez que alguien perdía su economía.",
      },
      {
        title: "VII. Defuse en el puente",
        text: "La final regional se jugó con el puente de Brooklyn de fondo. La bomba quedó plantada a cuarenta segundos del final y el último jugador vivo empezó a desactivarla sin kit, con dos rivales buscándolo entre el humo. Le alcanzó con dos décimas. En ese instante todas las luces del puente se volvieron moradas, y se quedaron así hasta el amanecer.",
      },
      {
        title: "VIII. El color de la amatista",
        text: "Los que llegaron a ganar un clutch esa temporada describen lo mismo: el último segundo antes de que la bomba explote tiene un color, y es morado. Dicen que los cristales se encienden justo ahí, cuando una sola persona decide la ronda. Un reporte interno ya los había bautizado desde el primer apagón, sin que nadie supiera quién lo escribió: Manhattan Amatista.",
      },
      {
        title: "IX. Ocho torres, un solo feed",
        text: "Al acercarse el cierre, las ocho azoteas empezaron a transmitir lo mismo: la gran final. El pulpo apareció completo por primera vez, abrazando la ciudad desde el río, con los ojos encendidos en morado sobre el skyline. Cuando cayó la última ronda, la marca se quedó fija en pantalla un segundo de más, y luego la señal se cortó, igual que en Mónaco.",
      },
      {
        title: "X. La próxima gema",
        text: "Nadie sabe todavía qué pasó con los cristales del metro ni quién encendió el Empire State aquella noche. Los que descifraron la frase de Times Square ya saben dónde va a reaparecer la señal. Pero la última transmisión de Manhattan guardó algo más: entre la estática, justo antes del corte, otra frase, tan torcida como la primera. Dicen que esconde el nombre de la próxima gema. La pregunta es si tu equipo va a estar ahí cuando se encienda.",
      },
    ],
  },
  "Ibiza Topacio": {
    tagline: "Una isla de fiesta en pleno invierno, sin una sola luz encendida, y una muralla que brilla en ámbar desde adentro.",
    part1: [
      {
        title: "I. La isla apagada",
        text: "Tres meses después de que la señal se cortara en Manhattan, apareció en el lugar menos pensado: Ibiza en enero, con las discotecas cerradas y el puerto vacío. A las 3:14 de la madrugada, la muralla de Dalt Vila empezó a brillar desde adentro, en un ámbar caliente que se filtraba por las grietas de la piedra. Los pocos vecinos que se asomaron juran que el muro latía.",
      },
      {
        title: "II. Cristales en la muralla",
        text: "Al amanecer, las grietas tenían dueño: cristales de topacio del tamaño de un puño, incrustados en la piedra como si hubieran crecido ahí durante siglos. Un arqueólogo del ayuntamiento intentó sacar uno con un cincel y lo dejó a la mitad: el cristal estaba tibio y vibraba con el mismo pitido que todos conocían de Manhattan. La bomba plantada, otra vez, acelerando.",
      },
      {
        title: "III. La arena bajo el mar",
        text: "Esta vez la marca no apareció en pantallas sino en el agua: en una cala del oeste, la marea baja dejó al descubierto la entrada de una cueva marina. Adentro había corriente, ocho monitores colgados de la roca y un tentáculo de topacio enroscado sobre la mesa de control. La arena de la temporada estaba bajo el nivel del mar, y solo se podía llegar con la marea baja.",
      },
      {
        title: "IV. Los que cruzaron el mar",
        text: "Llegaron en ferris, en vuelos de madrugada y hasta en un velero prestado. Algunos venían de ganar en Manhattan; otros, de perder ahí por dos décimas y con ganas de cobrársela. En la cueva no había señal de teléfono, así que los equipos tuvieron que aprender algo que en las ciudades grandes se había olvidado: hablarse sin pantalla de por medio, mirándose a los ojos entre ronda y ronda.",
      },
      {
        title: "V. Una frase en la roca",
        text: "La primera eliminación llegó con un AWP desde el fondo de la cueva, un tiro que nadie vio venir porque el destello rebotó en el agua. Esa misma noche, cuando bajó la marea, apareció una frase tallada en la roca, encima de los monitores. Hablaba de una fiera que duerme todo el invierno y de un arte de pelear con las manos vacías. Nadie entendió qué tenían que ver. Alguien la copió en el chat del torneo con la nota de siempre: el pulpo nunca dice las cosas de frente.",
      },
    ],
    part2: [
      {
        title: "VI. El invierno cobra",
        text: "A mitad de la temporada, el frío ya pesaba tanto como la economía. Las rondas se jugaban con la ropa mojada por la marea y los equipos aprendieron a ahorrar en serio: rondas eco con pistola, rifles comprados entre todos, nadie se daba el lujo de un force-buy a destiempo. Los cristales de la muralla, decían los que pasaban por Dalt Vila de noche, se apagaban un poco cada vez que un equipo se quedaba sin dinero.",
      },
      {
        title: "VII. El haz de Es Vedrà",
        text: "La final regional se definió en la última ronda, con la bomba plantada y un solo jugador vivo de cada lado. Cuando el defensor cortó el último cable, desde la cima del islote de Es Vedrà salió disparado hacia las nubes un haz de luz ámbar, recto como una antena. Se vio desde toda la isla y desde los barcos que pasaban. Duró exactamente lo que dura una bomba: cuarenta segundos.",
      },
      {
        title: "VIII. El color del topacio",
        text: "Los que ganaron un clutch esa temporada describen la misma sensación: un calor que sube por las manos justo antes del último disparo, como si alguien encendiera una lámpara ámbar adentro del pecho. Dicen que los cristales de la muralla brillan más en ese instante. Un reporte interno, sin firma, ya les había puesto nombre desde la primera noche: Ibiza Topacio.",
      },
      {
        title: "IX. La marea de la final",
        text: "La gran final se jugó en la cueva, con la marea bajando minuto a minuto y el agua golpeando la roca detrás de los monitores. El pulpo apareció completo en la boca de la cueva, con los ojos encendidos en ámbar, mirando la partida como un espectador más. Cuando cayó la última ronda, la marea empezó a subir y la señal se cortó. A la mañana siguiente, la entrada de la cueva estaba otra vez bajo el agua.",
      },
      {
        title: "X. La próxima gema",
        text: "Nadie sabe quién talló la frase de la roca ni cómo llegaron los cristales a una muralla de quinientos años. Los que la descifraron ya saben dónde va a reaparecer la señal. Pero la última transmisión de Ibiza guardó algo más: antes de que la marea tapara la cueva, la señal proyectó otra frase a los pies de un ángel de piedra de la catedral, bañado en una luz roja que nadie supo de dónde salía. Dicen que esconde el nombre de la próxima gema. La pregunta es si tu equipo va a estar ahí cuando se encienda.",
      },
    ],
  },
  "Osaka Rubí": {
    tagline: "Un canal de neón que se tiñe de rojo, cerezos que florecen fuera de tiempo y farolillos que se encienden solos.",
    part1: [
      {
        title: "I. El canal rojo",
        text: "Tres meses después de que la marea tapara la cueva de Ibiza, la señal volvió al otro lado del mundo. A las 3:14 de la madrugada, todos los neones del canal de Dotonbori, en Osaka, se apagaron a la vez y volvieron a encenderse en un solo color: rojo rubí. Debajo del agua, entre los reflejos, algo grande se movió. Los que estaban en el puente juran que vieron un tentáculo apoyarse en la baranda.",
      },
      {
        title: "II. Cristales bajo el agua",
        text: "Los buzos de la ciudad bajaron al canal al día siguiente. En el fondo, entre bicicletas viejas y monedas, encontraron cristales de rubí que brillaban con luz propia y latían con el pitido de siempre: la bomba plantada, acelerando. Los sacaron en baldes durante toda la tarde. A la noche, el fondo del canal estaba lleno otra vez.",
      },
      {
        title: "III. Cerezos fuera de tiempo",
        text: "Ese abril los cerezos alrededor del castillo de Osaka florecieron antes que en el resto de Japón, y sus pétalos caían de un rosa tan oscuro que parecía rojo. Sobre la muralla de piedra del castillo aparecieron ocho pantallas colgadas de la nada, con la marca del pulpo, esta vez rubí, y cada tentáculo apuntando a un callejón distinto de la ciudad.",
      },
      {
        title: "IV. Los que llegaron de la isla",
        text: "Algunos llegaron con la ropa todavía oliendo a la sal de Ibiza; otros eran caras nuevas de Tokio y de Kioto que habían seguido la señal por internet. En un callejón de farolillos rojos, detrás de un puesto de comida que solo abría de noche, estaba la arena: mesas bajas, monitores y un cartel escrito a mano. Los farolillos se encendían solos cada vez que empezaba una partida.",
      },
      {
        title: "V. Nieve en abril",
        text: "La primera eliminación fue una granada mal medida que rebotó en una pared del callejón y volvió a los pies de quien la tiró. Pero esa noche nadie habló de la ronda: sobre los cerezos del castillo empezó a nevar, en pleno abril, y entre los copos alguien juró oír a lo lejos los compases de un vals. En la nieve de la muralla quedó escrita una frase que no tenía ningún sentido. Debajo, la nota de siempre: el pulpo nunca dice las cosas de frente.",
      },
    ],
    part2: [
      {
        title: "VI. El precio del neón",
        text: "A mitad de la temporada, Osaka cobraba cada ronda. Los equipos comían en los puestos del callejón para ahorrar hasta el último yen y compraban rifles solo cuando alcanzaba para todos. Un force-buy a destiempo costaba tres rondas, y tres rondas en esa frecuencia eran media temporada. Los neones del canal, decían los que cruzaban el puente, se apagaban uno por uno cada vez que un equipo se quedaba sin economía.",
      },
      {
        title: "VII. Retake en el castillo",
        text: "La final regional se jugó con el castillo de fondo. El equipo atacante plantó la bomba y se escondió entre los cerezos, pero el último defensor vivo hizo el retake solo, entrando por el lado de la muralla que nadie cubría. Ganó la ronda con la vida justa. En ese momento cayeron a la vez todos los pétalos que quedaban en las ramas, como si los árboles también hubieran estado aguantando la respiración.",
      },
      {
        title: "VIII. El color del rubí",
        text: "Los que ganaron un clutch esa temporada cuentan lo mismo: un instante en que todo el sonido desaparece y la mira se ve teñida de rojo, como mirada a través de un cristal. Dicen que los rubíes del canal brillan más justo ahí. Un reporte interno, sin firma, los había bautizado desde la primera noche: Osaka Rubí.",
      },
      {
        title: "IX. Mil farolillos",
        text: "La gran final se jugó en el callejón, con mil farolillos encendidos sobre las cabezas de los equipos. El pulpo apareció completo sobre los techos, con los ojos encendidos en rojo, y los farolillos se mecían al ritmo de su respiración. Cuando cayó la última ronda se apagaron todos a la vez, y la señal se cortó, como siempre.",
      },
      {
        title: "X. La próxima gema",
        text: "Nadie sabe por qué nevó en abril ni quién colgó las pantallas en el castillo. Los que descifraron la frase de la nieve ya saben dónde va a reaparecer la señal. Pero la última transmisión de Osaka guardó algo más: el último día, en la casa de té del fondo del callejón, quedó sobre una mesa un mantel cortado a la mitad, y en la tela que quedaba, bordada con un hilo que ninguna tijera pudo cortar, otra frase tan torcida como la primera. Dicen que esconde el nombre de la próxima gema. La pregunta es si tu equipo va a estar ahí cuando se encienda.",
      },
    ],
  },
  "Viena Diamante": {
    tagline: "Una noria que gira sola en la niebla de verano, un baile de máscaras sin invitados y túneles donde brilla el hielo.",
    part1: [
      {
        title: "I. La noria que gira sola",
        text: "Tres meses después de que se apagaran los farolillos de Osaka, la señal llegó a Viena en pleno verano. A las 3:14 de la madrugada, con el parque cerrado y una niebla rara para julio, la noria gigante del Prater empezó a girar sola. Sus cabinas se encendieron una por una en un blanco helado con destellos cian. El guardia de turno contó ocho vueltas exactas antes de que se detuviera.",
      },
      {
        title: "II. Cristales en las cabinas",
        text: "Al día siguiente apareció en cada cabina de la noria un cristal transparente, del tamaño de un puño, que cortaba el vidrio de las ventanas como si fuera papel. Un joyero del centro fue a ver uno y salió pálido: no había herramienta en Viena capaz de rayarlo. Pegado al cristal se oía el pitido de siempre: la bomba plantada, acelerando.",
      },
      {
        title: "III. Un baile sin invitados",
        text: "La marca del pulpo apareció esta vez en un palacio barroco del centro, en un salón de baile cerrado hace años. Ocho espejos mostraban al pulpo, ahora blanco, y el candelabro de cristal colgaba encendido sobre un piso de mármol lleno de máscaras venecianas, como si los invitados se hubieran ido corriendo a mitad del baile. Al fondo, mesas y monitores: la arena estaba lista.",
      },
      {
        title: "IV. Los que llegaron del este",
        text: "Venían de Osaka con cuentas pendientes de la temporada anterior, y de Praga, Budapest y Múnich, atraídos por el rumor del palacio. La regla del salón quedó clara desde la primera noche: se jugaba con máscara. Nadie sabía con certeza quién estaba del otro lado de la mesa, y en esta frecuencia, decían, eso era lo más honesto que había.",
      },
      {
        title: "V. Una sola nota",
        text: "La primera eliminación fue un flash tirado al revés que cegó a todo el propio equipo. Pero lo que se recuerda de esa noche es otra cosa: una orquesta que nadie había visto entrar tocó en el salón una sola nota, larga y sostenida, y desde el fondo una voz respondió, como quien levanta la mano y dice presente. En el espejo más grande quedó escrita una frase que no tenía ningún sentido. Debajo, la nota de siempre: el pulpo nunca dice las cosas de frente.",
      },
    ],
    part2: [
      {
        title: "VI. El verano cobra",
        text: "A mitad de la temporada, el calor entraba por las ventanas del palacio y los equipos jugaban con las máscaras empañadas. La economía mandaba: rondas eco con pistola, rifles comprados entre todos, nadie arriesgaba un force-buy a destiempo. Los cristales de la noria, decían los que pasaban por el Prater de noche, perdían brillo cada vez que un equipo se quedaba sin dinero.",
      },
      {
        title: "VII. Por las alcantarillas",
        text: "La final regional se decidió bajo tierra. El último jugador vivo de su equipo rotó por las viejas alcantarillas abovedadas de Viena para llegar al sitio por donde nadie lo esperaba, siguiendo el brillo de los cristales incrustados en el ladrillo. Llegó con la bomba ya plantada y la desactivó con un segundo de margen. Arriba, en el salón, el candelabro se encendió entero.",
      },
      {
        title: "VIII. El color del diamante",
        text: "Los que ganaron un clutch esa temporada describen lo mismo: un frío que baja por la espalda en el último segundo y una claridad total, como si todo el salón se volviera transparente. Dicen que los cristales brillan más en ese instante, duros como nada en el mundo. Un reporte interno, sin firma, los había bautizado desde la primera noche: Viena Diamante.",
      },
      {
        title: "IX. La última vuelta",
        text: "La gran final se jugó en el salón de baile, con todas las máscaras puestas y la noria del Prater visible por la ventana. El pulpo apareció completo detrás de los espejos, con los ojos encendidos en blanco. Cuando cayó la última ronda, la noria dio una última vuelta, se detuvo y la señal se cortó.",
      },
      {
        title: "X. La próxima gema",
        text: "Nadie sabe quién tocó esa nota ni quién dejó las máscaras en el piso. Los que descifraron la frase del espejo ya saben dónde va a reaparecer la señal. Pero la última transmisión de Viena guardó algo más: en las alcantarillas apareció una caja de contrabando con el sello de un puerto del otro lado del estrecho, en el norte de África, y adentro, sobre un terciopelo color vino, otra frase tan torcida como la primera. Dicen que esconde el nombre de la próxima gema. La pregunta es si tu equipo va a estar ahí cuando se encienda.",
      },
    ],
  },
  "Miami Granate": {
    tagline: "Neones de los ochenta en Ocean Drive, una lancha sin piloto en la bahía y un huracán que llega justo a la final.",
    part1: [
      {
        title: "I. Ocean Drive en rojo vino",
        text: "Tres meses después de que la noria del Prater se detuviera, la señal cruzó el Atlántico. A las 3:14 de la madrugada, los neones de los hoteles art déco de Ocean Drive, en Miami, cambiaron todos al mismo color: un rojo vino profundo, como sacado de los ochenta. En la calle mojada por la lluvia, los que salían de los bares vieron un tentáculo enorme enroscado en una palmera, quieto, mirando.",
      },
      {
        title: "II. Cristales en la arena",
        text: "Al amanecer, la marea dejó en la playa cristales de granate, oscuros como el vino, que brillaban cuando les daba la luz de los neones. Los turistas se llevaron algunos en los bolsillos. Esa noche, todos los que se habían llevado uno escucharon lo mismo saliendo de su ropa: el pitido de la bomba plantada, acelerando.",
      },
      {
        title: "III. La arena del hotel",
        text: "La marca del pulpo apareció a la vez en ocho fachadas de Ocean Drive: el pulpo granate, cada tentáculo apuntando a un hotel distinto. Siete estaban cerrados por la temporada de huracanes. En el octavo, en un salón con vista al mar, había mesas, monitores y un cartel escrito a mano: la arena estaba lista.",
      },
      {
        title: "IV. Los que llegaron con la tormenta",
        text: "Venían de Viena, con la piel blanca de un verano bajo tierra, y de toda América, siguiendo la señal. Miami recibía a los equipos con un calor pegajoso y un aviso en todos los noticieros: se acercaba un huracán. Nadie se fue. En esta frecuencia, decían, lo que viene después de la tormenta siempre es una final.",
      },
      {
        title: "V. Una lancha sin piloto",
        text: "La primera eliminación fue un jugador que corrió sin pensar hacia un sitio que ya estaba perdido. Pero esa noche se recuerda por otra cosa: una lancha rápida, sin nadie a bordo, cruzó la bahía de Biscayne a toda velocidad dejando una estela de espuma roja. Cuando la encontraron varada, adentro había un póster viejo del Che, una pulsera de las que se compran para el buen karma y, escrita en el casco, una frase que no tenía ningún sentido. Debajo, la nota de siempre: el pulpo nunca dice las cosas de frente.",
      },
    ],
    part2: [
      {
        title: "VI. La temporada de huracanes",
        text: "A mitad de la temporada, el viento ya doblaba las palmeras de Ocean Drive y los equipos jugaban con las ventanas tapadas con tablas. La economía mandaba: rondas eco, rifles compartidos, ningún force-buy a destiempo. Los neones, decían los que pasaban por la calle de noche, parpadeaban cada vez que un equipo se quedaba sin dinero.",
      },
      {
        title: "VII. Persecución en la bahía",
        text: "La final regional se jugó con la bahía de fondo y los rascacielos de Brickell encendidos en granate. El último jugador vivo de cada equipo se buscó durante cuarenta segundos sin cruzarse, como dos lanchas en la niebla, hasta que uno cometió el error de moverse. La ronda terminó con un solo disparo. Afuera, sobre la estela de la lancha que nadie piloteaba, un tentáculo se levantó del agua formando un arco y volvió a hundirse.",
      },
      {
        title: "VIII. El color del granate",
        text: "Los que ganaron un clutch esa temporada cuentan lo mismo: un instante en que el ruido del viento desaparece y todo se ve de color vino, como mirado a través de una copa. Dicen que los cristales de la playa brillan más justo ahí. Un reporte interno, sin firma, los había bautizado desde la primera noche: Miami Granate.",
      },
      {
        title: "IX. El ojo del huracán",
        text: "La gran final se jugó la misma noche en que llegó el huracán. Afuera el mar se levantaba y los relámpagos caían en granate sobre el skyline. Justo en la última ronda, el ojo pasó por encima del hotel: silencio total, cielo despejado y dos tentáculos enormes alzándose desde el mar. Cuando cayó la última ronda, volvió el viento y la señal se cortó.",
      },
      {
        title: "X. La próxima gema",
        text: "Nadie sabe quién piloteaba esa lancha ni cómo supo el pulpo cuándo pasaría el ojo del huracán. Los que descifraron la frase del casco ya saben dónde va a reaparecer la señal. Pero la última transmisión de Miami guardó algo más: en el silencio del ojo, antes de que volviera el viento, todos los equipos escucharon por los auriculares una risa corta, y el mar se tiñó de verde durante un segundo. Después llegó otra frase, tan torcida como la primera. Dicen que esconde el nombre de la próxima gema. La pregunta es si tu equipo va a estar ahí cuando se encienda.",
      },
    ],
  },
};

const SEASON_LORE_FALLBACK = {
  heroArt: "",
  tagline: "El pulpo todavía está tallando la gema de esta temporada.",
  part1: [{ title: "Capítulo perdido", text: "Vuelve pronto — el Octágono todavía no ha escrito la leyenda de esta temporada." }],
  part2: [],
};

// Los dos crípticos de cada leyenda: la ciudad (a la mitad) y la gema (al
// final) de la temporada siguiente, para jugar (js/lore-cipher.js).
const CIPHERS = {
  city: {
    pick: (season) => season.city,
    intro: "A mitad de la temporada, la señal soltó una frase torcida. Esconde la ciudad donde el pulpo guardará la próxima gema.",
    solved: (word) => `Descifrado: el pulpo va a ${word}.`,
  },
  gem: {
    pick: (season) => season.gem,
    intro: "Antes de cortarse, la señal soltó una última frase. Esconde el nombre de la próxima gema.",
    solved: (word) => `Descifrado: la próxima gema es ${word}.`,
  },
};

// Un críptico por palabra, escrito a mano, con la clave tal como está en
// SEASON_CITIES o SEASON_GEMS (js/seasons.js). La frase tiene la definición
// (al principio o al final) y un juego de palabras: indicadores (qué hacer)
// y materiales (con qué). Las pistas de Significado, Indicador y Materiales
// muestran definition, indicator y materials; solution se lee al resolver o
// al rendirse. Una palabra sin críptico acá deja su transmisión oculta:
// escribir los de la temporada siguiente antes de que empiece.
const CRYPTICS = {
  // Para Manhattan Amatista (oct–dic 2026)
  Ibiza: {
    clue: "Un Dalí bizarro esconde la isla de la fiesta",
    definition: "la isla de la fiesta",
    indicator: "«Esconde» avisa que la respuesta está escrita, seguida, dentro de otras palabras de la frase.",
    materials: "Las letras están en «Dalí bizarro». No cuentan los espacios ni las tildes.",
    solution: "«esconde» marca una palabra escondida: dal·IBIZA·rro.",
  },
  Topacio: {
    clue: "La óptica revuelta con una o da la gema amarilla",
    definition: "la gema amarilla",
    indicator: "«Revuelta» avisa un anagrama: las mismas letras en otro orden. «Con» suma lo que sigue; «da» solo une con la definición.",
    materials: "«La óptica» y «una o», que es una sola letra.",
    solution: "ÓPTICA + O, revueltas: TOPACIO.",
  },
  // Para Ibiza Topacio (ene–mar 2027)
  Osaka: {
    clue: "Una osa con las dos primeras del kárate: la ciudad japonesa",
    definition: "la ciudad japonesa",
    indicator: "«Las dos primeras de» se queda con las dos primeras letras de lo que sigue. «Con» pega una parte detrás de la otra.",
    materials: "«Una osa», tal cual, y «kárate».",
    solution: "OSA más KA, las dos primeras de kárate: OSAKA.",
  },
  Rubí: {
    clue: "Un querubín esconde la gema roja",
    definition: "la gema roja",
    indicator: "«Esconde» avisa que la respuesta está escrita, seguida, dentro de otra palabra de la frase.",
    materials: "Las letras están en «querubín». No cuentan las tildes.",
    solution: "«esconde» marca una palabra escondida: que·RUBÍ·n.",
  },
  // Para Osaka Rubí (abr–jun 2027)
  Viena: {
    clue: "Nieva de otra manera en la ciudad del vals",
    definition: "la ciudad del vals",
    indicator: "«De otra manera» avisa un anagrama: las mismas letras en otro orden. «En» solo une con la definición.",
    materials: "Las cinco letras de «nieva».",
    solution: "NIEVA revuelto: VIENA.",
  },
  Diamante: {
    clue: "Un día con el mantel cortado: la piedra más dura",
    definition: "la piedra más dura",
    indicator: "«Cortado» quita la última letra. «Con» pega una parte detrás de la otra.",
    materials: "«Un día», tal cual, y «el mantel».",
    solution: "DÍA más MANTE(L): DIAMANTE.",
  },
  // Para Viena Diamante (jul–sep 2027)
  Miami: {
    clue: "Una nota y luego a mí: la ciudad de Florida",
    definition: "la ciudad de Florida",
    indicator: "«Y luego» pone una parte detrás de la otra.",
    materials: "«Una nota» es una nota musical de dos letras; «a mí» se usa tal cual, sin la tilde.",
    solution: "MI, la nota, más A MÍ: MIAMI.",
  },
  Granate: {
    clue: "Tánger revuelto con una a: la gema rojo vino",
    definition: "la gema rojo vino",
    indicator: "«Revuelto» avisa un anagrama: las mismas letras en otro orden. «Con» suma lo que sigue.",
    materials: "Las seis letras de «Tánger» y «una a», que es una sola letra.",
    solution: "TÁNGER + A, revueltos: GRANATE.",
  },
  // Para Miami Granate (oct–dic 2027)
  Marrakech: {
    clue: "Ciudad roja de Marruecos: karma y Che revueltos con otra erre",
    definition: "ciudad roja de Marruecos",
    indicator: "«Revueltos» avisa un anagrama: las mismas letras en otro orden. «Y» y «con» suman las partes.",
    materials: "«Karma», «Che» y «otra erre», que es una sola letra (karma ya trae la primera).",
    solution: "KARMA + CHE + R, revueltos: MARRAKECH.",
  },
  Jade: {
    clue: "Una risa de la piedra verde",
    definition: "la piedra verde",
    indicator: "No hay indicador escrito: las partes se pegan en el orden de la frase.",
    materials: "«Una risa» se escribe como suena, en dos letras; «de» se usa tal cual.",
    solution: "JA, una risa, más DE: JADE.",
  },
};

(function () {
  const heroImgEl = document.getElementById("season-lore-hero-img");
  const titleEl = document.getElementById("season-lore-title");
  const taglineEl = document.getElementById("season-lore-tagline");
  const part1El = document.getElementById("season-lore-part1");
  const part2El = document.getElementById("season-lore-part2");
  if (!titleEl && !taglineEl && !part1El && !part2El) return;

  const info = getSeasonInfo(currentSeasonIndex());
  const lore = SEASON_LORE[info.name] || SEASON_LORE_FALLBACK;

  if (titleEl) titleEl.textContent = info.name;
  if (taglineEl) taglineEl.textContent = lore.tagline;
  if (heroImgEl) {
    heroImgEl.src = lore.heroArt || "img/banners/bannerlite.webp";
    heroImgEl.alt = `Temporada actual: ${info.name}`;
  }

  function renderPanels(list) {
    return (list || [])
      .map(
        (p) => `
        <div class="lore-panel">
          <div class="lore-panel-title">${p.title}</div>
          <p class="lore-panel-text">${p.text}</p>
        </div>
      `
      )
      .join("");
  }

  if (part1El) part1El.innerHTML = renderPanels(lore.part1);
  if (part2El) part2El.innerHTML = renderPanels(lore.part2);

  const next = getSeasonInfo(info.index + 1);
  document.querySelectorAll(".lore-cipher[data-cipher]").forEach((el) => {
    const cipher = CIPHERS[el.dataset.cipher];
    if (!cipher) return;
    const word = cipher.pick(next);
    const cryptic = CRYPTICS[word];
    if (!cryptic) return;
    el.querySelector(".lore-cipher-intro").textContent = cipher.intro;
    mountCipherGame(el.querySelector(".cipher-game"), {
      word,
      cryptic,
      solvedText: cipher.solved,
      shareTitle: `${el.querySelector("h2").textContent.trim()} · ${info.name}`,
      storageKey: `octagono.criptico.${info.name}.${el.dataset.cipher}`,
    });
    el.hidden = false;
  });
})();
