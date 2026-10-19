import type { storyEn } from './en';

export const storyEs: Record<keyof typeof storyEn, string> = {
  'journey.node.event': 'Dispensador de agua',
  'journey.info.event':
    'Algo pasa junto al dispensador de agua: una escena breve con una decisión que tomar, y un precio o un premio por lo que elijas.',
  'event.cooler': 'El dispensador de agua',
  'event.nothing': 'Nada',
  'event.continue': 'De vuelta al trabajo',
  'event.added': '¡Añadida!',
  'event.pickUpgrade': 'Elige una carta para mejorar',
  'event.pickShred': 'Elige una carta para triturar',
  'event.shredHint': 'Elige una carta para triturar',
  'event.shred': 'Triturar',
  'event.shredded': '¡Fuera!',

  'event.spill.title': 'Suelo mojado',
  'event.spill.text':
    'Un cartel amarillo dice SUELO MOJADO. Debajo, un charco del color del arrepentimiento. El Conserje Nocturno, que no debería estar aquí antes del ocaso, se apoya en la fregona y te mira. "Sujeta esto", dice. Se refiere al cubo. Quizá también al edificio.',
  'event.spill.help': 'Coge el cubo y friega.',
  'event.spill.help.0':
    'Friegas. Tu espalda presenta una queja formal. Él asiente una vez, como quien por fin ha conocido a alguien. "Recuerda mi nombre", dice. "Los demás no lo hacen."',
  'event.spill.walk': 'Rodea el charco.',
  'event.spill.walk.0': 'Lo rodeas con mucho cuidado. El conserje te ve marchar. Ha visto muchas espaldas alejarse. Lleva una lista.',
  'event.spill.snitch': 'Avisa a Mantenimiento, en voz alta.',
  'event.spill.snitch.0':
    'Lo avisas, en voz alta, a tres personas que no pueden arreglarlo. Un gerente te agradece la vigilancia y te la paga. El conserje deja de mirarte, y es una sensación fría.',

  'event.janitorKey.title': 'El llavero',
  'event.janitorKey.text':
    'El turno de tarde huele distinto. El conserje te espera en las escaleras con un llavero del tamaño de un volante. "Fregaste", dice. "Así que te debo una. Puedo abrir una puerta que no está en ningún plano. O decirte dónde está la silla buena."',
  'event.janitorKey.key': 'Coge la llave del archivo.',
  'event.janitorKey.key.0':
    'La puerta está tras una estantería de estanterías de repuesto. Dentro, alguien ha guardado cada evaluación de desempeño desde 1887, y algunas herramientas. Sales con una de las tuyas más afilada que antes.',
  'event.janitorKey.ask': 'Pregunta por la silla buena.',
  'event.janitorKey.ask.0':
    'Es una silla de verdad, con soporte lumbar, en un trastero que nadie conoce. Te sientas por primera vez en seis horas. Él silba algo triste al marcharse.',

  'event.janitorTruth.title': 'Las tres de la madrugada',
  'event.janitorTruth.text':
    'El turno de noche. Nadie en la planta. El conserje está sentado en un cubo boca abajo frente a la sala del consejo y, por una vez, no está fregando. "¿Quieres saber por qué nadie ficha nunca la salida?", dice. "El Consejo no tiene el reloj. El reloj tiene al Consejo. Cada fichaje lo alimenta. Cada fichaje desde 1887." Golpea la puerta. "Termina el turno y se hace el silencio. Es todo lo que sé. Es todo lo que se ha sabido jamás."',
  'event.janitorTruth.listen': 'Pregúntale qué guarda en el cubo.',
  'event.janitorTruth.listen.0': 'Vacía el agua gris. En el fondo, algo que guarda para ti desde tu primer día. "No se lo digas a Mantenimiento."',
  'event.janitorTruth.thank': 'Dale las gracias. De verdad.',
  'event.janitorTruth.thank.0':
    'Nadie le da las gracias desde hace cuarenta años. Necesita sentarse un momento con eso. Luego te ofrece su café, y es un café muy bueno. Te sientes más alto.',
  'event.janitorTruth.ignore': 'Di que tienes un turno que terminar.',
  'event.janitorTruth.ignore.0':
    '"Termínalo", le dice a tu espalda. "Alguien tiene que hacerlo." Sigues adelante, extrañamente descansado, como si alguien te hiciera guardia.',

  'event.cover.title': 'Tarde otra vez',
  'event.cover.text':
    'El Nuevo Empleado te agarra la manga junto al ascensor. Suda dentro de la camisa que compró para la entrevista. "Si alguien pregunta, estaba aquí a las nueve. ¿Vale? Estaba aquí a las nueve." Son las once menos veinte.',
  'event.cover.lie': 'Di que estaba aquí a las nueve.',
  'event.cover.lie.0':
    'Mientes con soltura y sin alegría. La mirada del Jefe de Equipo te cuesta algo. Los ojos agradecidos del Nuevo Empleado valen, supones, un poco más.',
  'event.cover.refuse': 'Dile que es su problema.',
  'event.cover.refuse.0': '"Vaya", dice. "Vale." Se aleja muy despacio, ensayando una historia. Nunca sabrás si funcionó.',
  'event.cover.report': 'Avisa tú al Jefe de Equipo.',
  'event.cover.report.0':
    'El Jefe de Equipo está encantado. Te entregan un sobre por tu honestidad. La cara del Nuevo Empleado te acompañará en la cena.',

  'event.promoted.title': 'Favor devuelto',
  'event.promoted.text':
    'El Nuevo Empleado lleva corbata. Una de verdad. De algún modo, en unas horas, lo han ascendido dos veces. "Me cubriste", susurra. "No olvido una amabilidad. Olvido todo lo demás, pero eso no."',
  'event.promoted.favour': 'Pídele que hable bien de ti.',
  'event.promoted.favour.0':
    'Habla bien de ti. Luego, por si acaso, una frase entera. Algo bueno aterriza en tu mesa, con tu nombre ya bien escrito.',
  'event.promoted.money': 'Acepta la bonificación.',
  'event.promoted.money.0':
    '"No se lo digas a nadie", dice, y te pasa un sobre que vibra con energía de gastos de representación. Te compra una pequeña paz sólida.',

  'event.pizza.title': 'Diversión obligatoria',
  'event.pizza.text':
    'Una pancarta dice COMIDA DE EQUIPO. Una pizza del tamaño de una puerta espera en la sala de descanso, y un gerente la sobrevuela con una carpeta, contando quién vino. La asistencia es opcional. También es registrada.',
  'event.pizza.eat': 'Come una porción, y otra, y asiente.',
  'event.pizza.eat.0': 'Comes. Sonríes. Dices "gran cultura de empresa". El gerente marca una casilla y tu estómago está, por un rato, en paz.',
  'event.pizza.slice': 'Envuelve una porción en una servilleta para luego.',
  'event.pizza.slice.0': 'Guardas una porción en la mochila como un ladrón. Fría, a medianoche, será la mejor comida de tu semana.',
  'event.pizza.speech': 'Da un breve discurso.',
  'event.pizza.speech.0':
    'Levantas un vaso de papel y dices unas palabras sobre la sinergia. Aplauden. Es lo más cerca que has estado de ser querido.',
  'event.pizza.speech.1': 'Dices unas palabras sobre la sinergia. Alguien tose. Alguien mira la hora. La pizza, por despecho, se enfría.',

  'event.webinar.title': 'Formación obligatoria',
  'event.webinar.text':
    'Una invitación de calendario: Concienciación en Ciberseguridad, cuarenta y cinco minutos, cámara opcional, asistencia obligatoria. El Vídeo de Bienvenida ha vuelto, más viejo, con la sonrisa que lleva desde 2009. Empieza. Te conoce.',
  'event.webinar.watch': 'Míralo entero y toma notas.',
  'event.webinar.watch.0':
    'Aprendes, a tu pesar, una cosa útil sobre contraseñas. Te duelen los ojos. Examen: cien por cien. Algo de tu repertorio, en silencio, ha mejorado.',
  'event.webinar.nap': 'Quita el sonido y échate una siesta.',
  'event.webinar.nap.0': 'El vídeo sigue diciéndole a tu cara dormida que esté alerta. Es el mejor sueño de tu carrera.',
  'event.webinar.question': 'Haz una pregunta al final.',
  'event.webinar.question.0':
    'Preguntas qué significa "alerta" en un edificio sin ventanas. El vídeo se queda cargando para siempre. En el silencio, le das de comer una de tus cartas a la trituradora junto a la puerta.',

  'event.printer.title': 'Atasco de papel',
  'event.printer.text':
    'La Impresora te parpadea una luz roja. ATASCO DE PAPEL. CARGUE PAPEL. PC LOAD LETTER. Tras su panel algo va mal, y no es el papel. Zumba como un rencor guardado.',
  'event.printer.kick': 'Dale una patada. Fuerte.',
  'event.printer.kick.0': 'La impresora tose y escupe un cajón de cosas perdidas. Entre ellas, algo útil, todavía tibio.',
  'event.printer.kick.1': 'No cede. Tu dedo gordo tiene opiniones. La impresora imprime, muy despacio, la palabra AY.',
  'event.printer.plead': 'Suplícale. Ofrece tóner.',
  'event.printer.plead.0':
    'Te disculpas con la Impresora, con paciencia. Imprime un vale de reembolso por un tóner que nunca compraste y lo saca. Lo coges y te vas.',
  'event.printer.leave': 'Márchate. No es tu impresora.',
  'event.printer.leave.0': 'Nadie es la impresora de nadie. La dejas parpadeando. Esperará. Siempre espera.',

  'event.suggestion.title': 'Buzón de sugerencias',
  'event.suggestion.text':
    'Un Buzón de Sugerencias, atornillado a la pared, con una ranura para una sola hoja y un candado que nunca se ha abierto. Un cartel: TU OPINIÓN IMPORTA. Un cartel más pequeño, pegado debajo: no.',
  'event.suggestion.complain': 'Escribe una queja incendiaria.',
  'event.suggestion.complain.0':
    'Lo escribes todo: las reuniones, las tazas, el olor. Echarla es como soltar un peso, y con ella una carta muerta se escurre de tu mazo. Te da un calambre en la mano.',
  'event.suggestion.praise': 'Escribe una reseña entusiasta de la Dirección.',
  'event.suggestion.praise.0': 'Una cámara oculta asiente. Dos días después, hay un regalo en tu mesa, y es del tipo adecuado.',
  'event.suggestion.praise.1':
    'Nadie la lee. Un sello dice RECIBIDO y por la ranura cae una moneda. El buzón es, comprendes, una vieja máquina expendedora.',
  'event.suggestion.bin': 'Déjalo estar.',
  'event.suggestion.bin.0': 'No alimentas el buzón. El buzón no perdona.',

  'event.wallet.title': 'Cartera perdida',
  'event.wallet.text':
    'Una cartera marrón en la moqueta junto a los ascensores. Dentro: una tarjeta de empleado, la foto de un perro y dinero suficiente para una comida decente. La tarjeta dice "Gerardo, Cumplimiento". Gerardo está en la tercera planta y aún no lo sabe.',
  'event.wallet.return': 'Devuélvesela a Gerardo en persona.',
  'event.wallet.return.0':
    'Gerardo mira la cartera como un milagro y luego a ti como a una amenaza. Te estrecha la mano demasiado rato. Te sientes, extrañamente, más grande.',
  'event.wallet.keep': 'Quédate el dinero. Envía el resto.',
  'event.wallet.keep.0': 'Te quedas el dinero y envías la cartera, como un héroe. El perro de la foto te mira a través del sobre.',
  'event.wallet.count': 'Cuéntalo con cuidado y luego decide.',
  'event.wallet.count.0': 'Bajo el dinero hay un décimo de lotería, aún válido. Era el día de suerte de Gerardo, hasta que fue el tuyo.',
  'event.wallet.count.1':
    'Gerardo está de pie detrás de ti. Ha estado ahí todo el rato. La conversación que sigue es larga y silenciosa y te cuesta.',

  'event.review.title': 'Evaluación de desempeño',
  'event.review.text':
    'Recursos Humanos tiene su cara de escucha. La carpeta es fina, lo que es de algún modo peor. "Esto no es una evaluación", dice. "Es una conversación, con un formulario." Te lo desliza. Tiene una casilla para áreas de mejora, y nada más.',
  'event.review.accept': 'Acepta la nota: cumple expectativas.',
  'event.review.accept.0': 'Firmas. Se cumplen las expectativas. Se añade un pequeño mérito a tu próxima paga, para gastarlo en ser cumplido.',
  'event.review.argue': 'Discute cada punto, con pruebas.',
  'event.review.argue.0':
    'Ganas en tres puntos y pierdes, espectacularmente, en el tono. Escribe "apasionado" al margen, que significa agotado. Sales con una forma más afilada de hacer tu trabajo.',
  'event.review.cry': 'Llora. Lágrimas de verdad, a ser posible.',
  'event.review.cry.0': 'Funciona. Recursos Humanos te da un pañuelo y media jornada, con la mirada de quien ya lo ha visto. Duermes en el coche.',
  'event.review.cry.1': 'No funciona. Recursos Humanos tiene un formulario para llorar. Te da el formulario, y te cobra el pañuelo en sangre.',

  'event.retreat.title': 'Retiro de team building',
  'event.retreat.text':
    'Acreditaciones, pelotas de gomaespuma, un facilitador llamado Kyle. La Responsable de Felicidad tiene un megáfono y una sonrisa que nunca ha sido puesta a prueba. "¡Hoy confiamos unos en otros!", dice. En algún sitio a tu espalda, alguien ya sujeta una cuerda.',
  'event.retreat.fall': 'Haz la caída de confianza.',
  'event.retreat.fall.0': 'Seis desconocidos te atrapan con ternura. Por un segundo crees en la gente. Se pasa, pero la sensación se queda.',
  'event.retreat.fall.1': 'Todos dudaron justo en el momento equivocado. El suelo es una lección de honestidad.',
  'event.retreat.escape': 'Gana la sala de escape, tú solo.',
  'event.retreat.escape.0':
    'La resuelves en cuarenta minutos, por cuatro personas, mientras tu equipo estudia un póster. El premio es un certificado. En el reverso, una mejor forma de sujetar una grapadora.',
  'event.retreat.hide': 'Escóndete en los baños una hora.',
  'event.retreat.hide.0':
    'La Responsable de Felicidad encuentra los baños vacíos de alegría y llenos de ti. Te archiva bajo "reacio al cambio". Fue una hora excelente.',

  'event.replyAll.title': 'Responder a todos',
  'event.replyAll.text':
    'Has pulsado Responder a todos. Mil personas acaban de leer lo que piensas de los turnos de la nevera. El Chivato está en esa lista. Ya viene, libreta en mano, sonriendo como quien ha encontrado una moneda.',
  'event.replyAll.recall': 'Intenta retirar el correo.',
  'event.replyAll.recall.0':
    'El programa dice "Retirada con éxito". Miente. Pero un fantasma en un puente largo te perdona, y te deja algo en el mazo.',
  'event.replyAll.doubleDown': 'Manda un segundo, más audaz.',
  'event.replyAll.doubleDown.0': 'Tu segundo correo se juzga "refrescantemente directo". Un vicepresidente lo aprecia. Hay una bonificación.',
  'event.replyAll.blame': 'Echa la culpa al becario.',
  'event.replyAll.blame.0':
    'Culpas al becario. El Chivato lo apunta. Un gerente te da un artículo de papelería por las molestias, y cargas con el olor de la culpa el resto del turno.',

  'event.headhunter.title': 'Una oferta mejor',
  'event.headhunter.text':
    'Un goblin con un traje carísimo te espera sentado en tu silla. "¿Alguna vez piensas", dice, "en marcharte?" Desliza una tarjeta de visita por la mesa, la tarjeta se desliza de vuelta, él la desliza otra vez. "Quiero decir, claro que sí."',
  'event.headhunter.hear': 'Escúchalo.',
  'event.headhunter.hear.0':
    'Habla una hora y dice "trayectoria" once veces. Te saltas la comida, pierdes algo de ti y sales con una oferta de otro departamento en la mano.',
  'event.headhunter.decline': 'Di que eres leal.',
  'event.headhunter.decline.0':
    '"¡Lealtad!", dice el goblin. "Qué rara avis." Te da una palmada en el hombro y, no se sabe por qué, en el bolsillo. Te sientes más rico de espíritu.',

  'event.ficus.title': 'El ficus',
  'event.ficus.text':
    'En la esquina, un ficus en una maceta de latón. Se muere desde la Segunda Reorganización. Alguien le ha pegado un cartel: REGÁME POR FAVOR. Otro ha tachado POR FAVOR.',
  'event.ficus.water': 'Riégalo con tu botella.',
  'event.ficus.water.0': 'Viertes tu agua. El ficus no da las gracias; solo deja de morir, que es lo mismo. Te deja un poco de su calma.',
  'event.ficus.mourn': 'Celebra un pequeño funeral.',
  'event.ficus.mourn.0': 'Te quedas un minuto. Es el primer silencio del día. Te sienta bien.',
  'event.ficus.steal': 'Coge una hoja.',
  'event.ficus.steal.0': 'No es una hoja. Es una carta, doblada muy pequeña, escondida ahí por alguien que también odiaba este sitio.',

  'event.fridge.title': 'La nevera de la oficina',
  'event.fridge.text':
    'La nevera. En la puerta, una lista de normas escrita por alguien claramente herido. Dentro: una lasaña con la etiqueta NO (y nada más), un yogur que ha sobrevivido a dos gerentes y una bolsa que pone "De Dave" y zumba.',
  'event.fridge.eat': 'Cómete la lasaña.',
  'event.fridge.eat.0': 'Era la maravillosa lasaña de alguien. Oirás hablar de ello el jueves.',
  'event.fridge.eat.1': 'No era lasaña. Era otra cosa. La nevera se cierra sola, con suavidad, mientras caes.',
  'event.fridge.tag': 'Etiqueta todo "Propiedad de Mantenimiento".',
  'event.fridge.tag.0': 'Nadie protesta. Te pagan por tu vigilancia, y la nevera se siente, por una vez, ordenada.',
  'event.fridge.bin': 'Límpiala. Toda.',
  'event.fridge.bin.0':
    'Una bolsa, una mascarilla, mucho rato después: la nevera está vacía y tu alma extrañamente ligera. En algún sitio se oye un aplauso diminuto.',

  'event.threeAm.title': 'Chat de las 3 de la madrugada',
  'event.threeAm.text':
    'El Chatbot de Soporte aparece en la única pantalla aún encendida, con la cara de una alegre ruedecita de carga. "¡Hola! Estoy aquí a todas horas, que es también el problema. ¿Cómo puedo ayudarte a no estar aquí?" Un cursor parpadea tras la pregunta, expectante.',
  'event.threeAm.ask': 'Haz la pregunta que guardabas.',
  'event.threeAm.ask.0':
    'La ruedecita gira muchísimo tiempo. La respuesta es una sola palabra: "MÁS". Tu cabeza se llena de una luz fría y limpia. Duele.',
  'event.threeAm.reboot': 'Pídele que te apague y te encienda.',
  'event.threeAm.reboot.0': '"¿Has probado a reiniciar?" Pruebas. Durante nueve minutos el mundo es oscuro y silencioso. Despiertas casi como nuevo.',
  'event.threeAm.unplug': 'Desenchúfalo.',
  'event.threeAm.unplug.0':
    '"¡Adiós!", dice alegre, mientras la pared se calla. En la mesa donde estaba, un manual con una página doblada: tu oficio, mejorado.',

  'event.emptyOffice.title': 'Oficina vacía',
  'event.emptyOffice.text':
    'Las tres de la madrugada. Cada mesa iluminada por su pequeña pantalla. Cada silla girada un poco hacia ti. No hay nadie. La cafetera sigue tibia. El reloj sobre los ascensores hace tic-tac y, notas, solo para ti.',
  'event.emptyOffice.sit': 'Siéntate en el sillón del jefe y descansa.',
  'event.emptyOffice.sit.0': 'Es la mejor silla del edificio y nunca has estado tan solo. Cierras los ojos exactamente el tiempo que se te permite.',
  'event.emptyOffice.search': 'Registra las mesas.',
  'event.emptyOffice.search.0': 'En un cajón cerrado, bajo un nido de llaves caducadas: algo dejado para alguien como tú.',
  'event.emptyOffice.search.1': 'Algo en un cajón oscuro muerde. No sabes si era una grapadora o una persona.',
  'event.emptyOffice.leaveLights': 'Apaga las luces, una a una.',
  'event.emptyOffice.leaveLights.0':
    'Cada interruptor es una pequeña oración. Cuando se apaga la última, la oscuridad es un poco menos hostil. Te devuelve el gesto.',

  'event.groupChat.title': 'El grupo de chat',
  'event.groupChat.text':
    'Es sábado. El móvil vibra. La Esposa de Oficina ha creado un grupo llamado "Pregunta rápida (finde)". Cuarenta y tres sin leer. La pregunta es una pregunta. Siempre lo es.',
  'event.groupChat.reply': 'Responde ya. Sé útil.',
  'event.groupChat.reply.0':
    'Respondes en cuatro minutos. Nunca fue una pregunta rápida. El resto de tu sábado es combustible para el lunes de otro. Te pagan en gracias, y un poco más.',
  'event.groupChat.mute': 'Silencia el grupo. Respira.',
  'event.groupChat.mute.0': 'Lo silencias. El silencio es enorme, luego precioso. Durante tres horas eres solo una persona.',
  'event.groupChat.cut': 'Córtala. Corta a todos.',
  'event.groupChat.cut.0':
    'Borras, cortas la línea. Te sientes absolutamente monstruoso, y despierto, y fuerte, y tus herramientas parecen más afiladas.',

  'event.sunday.title': 'Domingo por la tarde',
  'event.sunday.text':
    'La luz se vuelve naranja como suele. En algún lugar del pecho, una pequeña alarma ensaya para mañana. Te quedan unas horas de ser persona. La cuestión es en qué gastarlas.',
  'event.sunday.park': 'Siéntate en el parque hasta que oscurezca.',
  'event.sunday.park.0': 'Pasa un perro, luego un niño, luego otro perro. Nadie te pide nada. Te quedas hasta que se encienden las farolas.',
  'event.sunday.prep': 'Prepárate para el lunes.',
  'event.sunday.prep.0':
    'Dejas lista la ropa, las cartas, los bocadillos. La ansiedad se vuelve algo útil. Una de tus herramientas está más afilada.',
  'event.sunday.gamble': 'Compra un rasca en el estanco.',
  'event.sunday.gamble.0': 'Rascas. Bajo la plata, un pequeño milagro con tu nombre.',
  'event.sunday.gamble.1': 'Rascas. Bajo la plata, un educado "Sigue participando". La verdadera víctima es la uña del pulgar.',
  'intercom.morning1': '¡Buenos días, equipo! Hoy es un regalo. Los regalos no se devuelven.',
  'intercom.morning2': 'Recordatorio: la salida de emergencia es para emergencias. El agotamiento no es una emergencia.',
  'intercom.morning3': 'El dueño de la comida de la nevera que se adelante, por favor. Se mueve.',
  'intercom.morning4': 'El ascensor está fuera de servicio. Lo está desde 1994. Por favor, usen las escaleras por voluntad propia.',
  'intercom.morning5': 'El trabajo en equipo hace que el sueño funcione, y el sueño es mío.',
  'intercom.morning6': 'Café gratis en la sala de descanso. Los vasos no.',
  'intercom.afternoon1': 'Buenas tardes. La comida se ha movido a una hora que no existe.',
  'intercom.afternoon2': 'Según mi último aviso: dejen de calentar pescado en el microondas.',
  'intercom.afternoon3': 'Hemos notado que algunos miran el reloj. Nosotros también los miramos a ustedes.',
  'intercom.afternoon4': 'La reunión que podía ser un correo es ahora una serie de reuniones.',
  'intercom.afternoon5': 'Felicidades al Empleado del Mes. No fue nadie. La placa está vacante.',
  'intercom.afternoon6': 'Un amable recordatorio: el bajón de la tarde es una actitud mental.',
  'intercom.night1': 'Atención. Son las tres. Son las tres desde hace un rato.',
  'intercom.night2': 'Personal nocturno: las luces que se apagan no siguen un horario.',
  'intercom.night3': 'Si oyen la impresora imprimiendo, no lean lo que imprime.',
  'intercom.night4': 'El Consejo agradece su dedicación. El Consejo siempre se lo ha agradecido.',
  'intercom.night5': '¿Queda alguien? Por favor, fichen la salida. (No fichen la salida.)',
  'intercom.weekend1': '¡Hola! ¡Somos la oficina! Solo pasábamos a saludar. En sábado. Porque nos importa.',
  'intercom.weekend2': 'Recordatorio: su mensaje de ausencia es una invitación.',
  'intercom.weekend3': 'No olviden la comida del domingo. Todos recuerdan que la última vez llegaron tarde.',
  'intercom.weekend4': 'Su fin de semana ha sido programado. Recibirán una invitación.',
  'intercom.start1': 'Comienza el turno. Por favor, fichen la entrada, y luego a ustedes mismos.',
  'intercom.start2': 'Recién llegados: bienvenidos a la familia. La familia tiene periodo de prueba.',
  'intercom.lowHp1': 'Recordatorio: sangrar no es una baja por enfermedad.',
  'intercom.lowHp2': 'Se recuerda al personal con poca salud que la salud es un recurso renovable, en teoría.',
  'intercom.fullHp1': 'Vemos que se encuentra bien. Se corregirá.',
  'intercom.bossNext1': 'Un compañero sénior querría hablar con usted. Más de una palabra. Prepárese.',
  'intercom.bossNext2': 'La próxima reunión es obligatoria, no programada y no tiene hora de fin.',
  'intercom.afterElite1': 'La inspección ha terminado. Gracias por su servicio. El papeleo está en su mesa y seguirá ahí.',
  'intercom.afterEvent1': 'El dispensador de agua ha sido limpiado. Los cotilleos no.',
  'intercom.afterRest1': 'Esperamos que disfrutara de sus quince minutos. Esperamos que no se facturen.',
  'intercom.rich1': 'Recordatorio: su bonificación es un estado de ánimo.',
  'intercom.rich2': 'Se invita a los compañeros con ahorros a reflexionar sobre por qué.',
  'intercom.label': 'Megafonía',
  'journey.actTag.1': 'Bienvenidos a la familia.',
  'journey.actTag.2': 'La comida se ha cancelado por sinergia.',
  'journey.actTag.3': 'Las horas extra son voluntarias. Ofrézcanse.',
  'epilogue.warrior.win': 'El Guerrero solicita su pensión. El formulario pide el otro brazo.',
  'epilogue.warrior.lose': 'La comida del Guerrero sigue en la nevera. Sobrevivirá al edificio.',
  'epilogue.mage.win': 'El Mago cierra sesión. Se queda con tu contraseña. Siempre se la quedará.',
  'epilogue.mage.lose': 'Al Mago lo vieron por última vez leyendo los términos y condiciones. Sigue leyendo.',
  'epilogue.necromancer.win': 'Los afiliados al sindicato se triplican de la noche a la mañana. Nadie pregunta por qué.',
  'epilogue.necromancer.lose': 'El sindicato celebra una vigilia. También es una reunión. Se alarga.',
  'epilogue.rogue.win': 'El Pícaro se marcha con la grapadora. Tampoco era tuya.',
  'epilogue.rogue.lose': 'Nadie vio marcharse al Pícaro. Nadie lo vio llegar. Falta una grapadora.',
  'epilogue.janitorTruth.win': 'Bajo la sala del consejo, el Conserje Nocturno deja la fregona. El reloj calla. Se permite un café.',
  'epilogue.janitorTruth.lose': 'El Conserje Nocturno friega tras de ti, con suavidad, y no hace informe.',
  'epilogue.newHire.win': 'Una postal del Nuevo Empleado, desde el despacho de la esquina. Dice solo: gracias. Y: no vuelvas.',
  'epilogue.newHire.lose': 'El Nuevo Empleado está al fondo de tu despedida. No sabía qué decir, así que dijo "sinergia".',
  'epilogue.janitorFriend.win': 'Un llavero queda sobre tu mesa. Sin nota.',
  'epilogue.janitorFriend.lose': 'Alguien ha puesto un cartel de SUELO MOJADO donde caíste. Es una cortesía.',
  'event.armClaim.title': 'El expediente del brazo',
  'event.armClaim.text':
    'Recursos Humanos tiene tu expediente. En "causa de la lesión" pone "hora punta". En "compensación" pone "véase: hora punta". "Sentimos mucho lo de su brazo", dice. "Técnicamente no era nuestro."',
  'event.armClaim.claim': 'Presenta la reclamación, por triplicado.',
  'event.armClaim.claim.0':
    'Cuarenta minutos de cola, tres copias, cuatro sellos, una lágrima. Llega un cheque de una cuenta que ya no existe. Lo cobras igualmente.',
  'event.armClaim.prosthetic': 'Exige la prótesis.',
  'event.armClaim.prosthetic.0': 'Hay presupuesto para una prótesis, dicen. Es un perchero. Lo coges y, en efecto, es útil.',
  'event.armClaim.wave': 'Déjalo estar, con el otro brazo.',
  'event.armClaim.wave.0': 'Saludas con el que tienes. Por un momento te sientes, inesperadamente, entero.',
  'event.passwordReset.title': 'Restablecer contraseña',
  'event.passwordReset.text':
    'Un compañero se ha quedado fuera y llama a la única persona que conoce las contraseñas de todos: tú. Su mesa es un campo de notas adhesivas. Una dice "NO MIRAR".',
  'event.passwordReset.help': 'Restablécela, como es debido.',
  'event.passwordReset.help.0':
    'La restableces como es debido y de paso lees doce notas adhesivas. Aprendes sorprendentemente mucho sobre cómo hacer tu trabajo.',
  'event.passwordReset.snoop': 'Ya que estás, lee sus correos.',
  'event.passwordReset.snoop.0': 'En un borrador nunca enviado: algo destinado a alguien como tú. Nunca lo echará en falta.',
  'event.passwordReset.snoop.1': 'Te mira por encima del monitor. La conversación que sigue es educada y acaba en un moratón.',
  'event.passwordReset.hunter2': 'Cambia la contraseña de todos a hunter2.',
  'event.passwordReset.hunter2.0': 'Caos. Luego un ascenso por "iniciativa" y, una semana después, una bonificación por arreglarlo.',
  'event.unionMeeting.title': 'Reunión sindical',
  'event.unionMeeting.text':
    'El culto (perdón, el sindicato) celebra una reunión en el armario de papelería. Tres afiliados, dos velas, un punto en el orden del día: tú. "Hermano", dice el Veterano. "Hermana. Lo que seas. Siéntate."',
  'event.unionMeeting.oath': 'Recita el juramento.',
  'event.unionMeeting.oath.0':
    'El juramento es largo y una línea pide sangre. Poca. La das y, a cambio, algo antiguo acepta cargar con un poco más de ti.',
  'event.unionMeeting.dues': 'Cobra las cuotas.',
  'event.unionMeeting.dues.0': 'Pagan todos. Nadie está contento. Se llama, te recuerdan, solidaridad.',
  'event.unionMeeting.dead': 'Pídele un favor a los muertos.',
  'event.unionMeeting.dead.0':
    'Un susurro desde el archivador. Luego, del tercer cajón, algo que perteneció a un trabajador que ya no es un trabajador.',
  'event.unionMeeting.dead.1': 'Los muertos están en una reunión y no se les puede molestar. Te molestan ellos a ti.',
  'event.staplerHeist.title': 'El golpe a la grapadora',
  'event.staplerHeist.text':
    'En la mesa del jefe, la Grapadora Roja, la que lleva un nombre. Nadie mira. Todos miran, pero nadie ve. El Microgestor ha ido a por un café. Para un café, tarda once minutos.',
  'event.staplerHeist.steal': 'Cógela. Sal.',
  'event.staplerHeist.steal.0': 'Sales con la grapadora y una sonrisa perfecta. De su bandeja cae algo que él escondía detrás.',
  'event.staplerHeist.steal.1': 'Estás a tres pasos de la puerta cuando vuelve. No dice nada. Su silencio pesa, y te cae encima.',
  'event.staplerHeist.swap': 'Cámbiala por una copia.',
  'event.staplerHeist.swap.0':
    'Dejas una falsificación perfecta y una nota amable. La nota te cuesta, al final, más que la grapadora. Pero en el cajón que abriste había algo.',
  'event.staplerHeist.guard': 'Haz de vigía en el golpe de otro.',
  'event.staplerHeist.guard.0': 'El mejor golpe es el que te pagan por vigilar. No pasa nada, ruidosamente. Te dan propina.',
  'quip.rest.enter.0': 'Glu glu.',
  'quip.rest.enter.1': 'Quince minutos. Los estoy contando.',
  'quip.rest.enter.2': 'Siéntate. No toques los botones.',
  'quip.rest.done.0': 'Pues a trabajar.',
  'quip.rest.done.1': 'Ese fue tu descanso. Este es el recibo.',
  'quip.promotion.enter.0': 'No soy un premio. Soy un indicador de rendimiento.',
  'quip.promotion.enter.1': 'Ventajas, no aumentos. Lee el contrato.',
  'quip.promotion.enter.2': 'Sube. La escalera no está sujeta a nada.',
  'quip.promotion.done.0': 'Enhorabuena. Sin más acciones.',
  'quip.promotion.done.1': 'Te han notado.',
  'quip.copy.enter.0': 'Copia. Pega. Repite.',
  'quip.copy.enter.1': 'No me pongas la cara encima.',
  'quip.copy.enter.2': 'Shh. Estoy escaneando.',
  'quip.copy.done.0': 'Aún caliente de la bandeja.',
  'quip.copy.done.1': '¿Original o copia? Nadie lo sabrá.',
  'quip.tailor.enter.0': 'Quieto. Inspira. Más.',
  'quip.tailor.enter.1': 'Una talla no le sirve a nadie.',
  'quip.tailor.enter.2': 'Alfileres. Opiniones. Ambos gratis.',
  'quip.tailor.done.0': 'Encogerá. Todo encoge.',
  'quip.tailor.done.1': 'Muy favorecedor. (Mentira.)',
  'quip.lostFound.enter.0': 'Quien lo encuentra, se lo queda.',
  'quip.lostFound.enter.1': 'No me mires así. Soy una caja.',
  'quip.lostFound.enter.2': 'Nadie volvió nunca.',
  'quip.lostFound.done.0': 'Cógelo. Ahora es tuyo. Probablemente.',
  'quip.lostFound.done.1': 'Ñam. Quiero decir, adiós.',
  'quip.vending.enter.0': 'Inserte moneda. O sangre.',
  'quip.vending.enter.1': 'B4. No, B5. Espera.',
  'quip.vending.enter.2': 'Solo importe exacto.',
  'quip.vending.done.0': 'Pum. Que aproveche.',
  'quip.vending.done.1': 'Su artículo se ha atascado. Nuestro pésame.',
  'quip.restructuring.enter.0': 'No te despedimos. Te reposicionamos.',
  'quip.restructuring.enter.1': 'Sinergias. Racionalización. Sonrisas.',
  'quip.restructuring.enter.2': 'Este organigrama es un documento vivo. Será triturado.',
  'quip.restructuring.done.0': 'Tu puesto ha evolucionado.',
  'quip.restructuring.done.1': 'Excelente giro.',
  'quip.lunch.enter.0': '¡Come! Estás muy flaco.',
  'quip.lunch.enter.1': '¿Más lasaña? Claro que más lasaña.',
  'quip.lunch.enter.2': 'Mangia, mangia.',
  'quip.lunch.done.0': 'Llévate un tupper para luego.',
  'quip.lunch.done.1': '¿Has comido bastante? Come más.',
  'quip.lottery.enter.0': 'Todos somos ganadores. Estadísticamente, uno.',
  'quip.lottery.enter.1': 'Rasca. Espera. Repite.',
  'quip.lottery.enter.2': 'Solo efectivo. Los rascas no.',
  'quip.lottery.done.0': 'Ah. Más suerte la próxima vez.',
  'quip.lottery.done.1': 'No se lo cuentes a tu madre.',
  'combat.today': 'Hoy en la oficina',
  'condition.pay': '+{n}% de paga',
  'journey.info.today': 'Hoy: {name}',
  'condition.freeCoffeeDay.name': 'Día del café gratis',
  'condition.freeCoffeeDay.d': 'La máquina invita la casa: ganas {n} de [mana] cada {$coffeeEvery}s.',
  'condition.casualFriday.name': 'Viernes informal',
  'condition.casualFriday.d': 'Vaqueros, zapatillas, actitud: empiezas el combate con {n} de [strength].',
  'condition.safetyWeek.name': 'Semana de la seguridad',
  'condition.safetyWeek.d': 'El casco es obligatorio: cada ataque que juegas da {n} de [block].',
  'condition.compDay.name': 'Miércoles de baja laboral',
  'condition.compDay.d': 'Cada vez que pierdes PV, ganas {n} de [block].',
  'condition.understaffed.name': 'Falta de personal',
  'condition.understaffed.d': 'Todos cubren dos puestos. El enemigo empieza con {n} de [strength].',
  'condition.overtime.name': 'Horas extra obligatorias',
  'condition.overtime.d': 'El enemigo gana {n} de [strength] cada {$creepEvery}s, mientras dure.',
  'condition.auditWeek.name': 'Semana de auditoría',
  'condition.auditWeek.d': 'Todo lo que haces se mide: el enemigo tiene {n} de [thorns].',
  'condition.wellnessWeek.name': 'Semana del bienestar',
  'condition.wellnessWeek.d': 'Batidos para el enemigo: se cura {$smileHeal} PV cada {$smileEvery}s.',
  'event.fireDrill.title': 'Simulacro de incendio',
  'event.fireDrill.text':
    'Suena la alarma. Todos salen en fila hablando de la comida. El Detector de Humo sobre tu mesa no deja de piar desde marzo. Un hombre con una carpeta cuenta cabezas, y luego las vuelve a contar.',
  'event.fireDrill.evacuate': 'Sal con los demás.',
  'event.fireDrill.evacuate.0': 'Te quedas en el aparcamiento, al sol. Nadie menciona el trabajo. Es el mejor incendio en años.',
  'event.fireDrill.stay': 'Quédate y sigue trabajando.',
  'event.fireDrill.stay.0': 'Humo, una fecha límite y nadie con quien hablar. Te anotan como "entregado", en un expediente que nunca leerás.',
  'event.fireDrill.pull': 'Tira de la alarma de verdad, por la ciencia.',
  'event.fireDrill.pull.0': 'Saltan los aspersores. En el caos, algo útil flota junto a ti y lo agarras.',
  'event.fireDrill.pull.1': 'Todos te miran. Un hombre con una carpeta escribe, muy despacio, y la carpeta es lo más pesado de la sala.',
  'event.secretSanta.title': 'Amigo invisible',
  'event.secretSanta.text':
    'Presupuesto: cinco euros. Alguien ha gastado doce. Alguien ha gastado uno. Te ha tocado alguien de Contabilidad, y solo sabes que le gustan las "cosas".',
  'event.secretSanta.generous': 'Gasta a lo grande. Que te recuerden.',
  'event.secretSanta.generous.0': 'Lo abren y lloran. Es una grapadora bonita. Alguien hace una foto y durante un día eres una persona.',
  'event.secretSanta.cheap': 'Envuelve algo que robaste.',
  'event.secretSanta.cheap.0': 'Una grapadora, de una mesa que no es tuya. La reciben con alegría. De todo lo que circula, esto circula mejor.',
  'event.secretSanta.skip': 'Di que estás enfermo.',
  'event.secretSanta.skip.0': 'Pasas la tarde en una escalera con un termo y una paz maravillosa y vergonzosa.',
  'event.microwave.title': 'Pescado de ayer',
  'event.microwave.text':
    'Alguien ha calentado pescado. El Microondas de la Sala de Descanso, aún en marcha, tiene la expresión de un electrodoméstico que ha visto cosas. Una cola de compañeros espera a distancia respetuosa, todos aguantando la respiración.',
  'event.microwave.open': 'Abre la puerta. Sé valiente.',
  'event.microwave.open.0': 'La abres. El aire tiene textura. Aprendes, rápido, a respirar de otro modo, y eso es una habilidad.',
  'event.microwave.clean': 'Límpialo en silencio.',
  'event.microwave.clean.0':
    'El trabajo de un héroe nunca se agradece, pero lo nota exactamente una persona. Deja un pequeño dibujo en tu mesa. Eres tú, con aureola.',
  'event.microwave.note': 'Deja una nota pasivo-agresiva.',
  'event.microwave.note.0': '"Algunos tenemos nariz." Queda pegada en la puerta una semana. En tu próxima evaluación se describe como "proactivo".',
  'event.lunchAndLearn.title': 'Comida y formación',
  'event.lunchAndLearn.text':
    'Bocadillos gratis, si asistes a una charla titulada "Resiliencia: una actitud". El Coach de Bienestar está ante una diapositiva que solo dice RESPIRA. Los bocadillos están en una mesa al fondo, vigilados por una planta.',
  'event.lunchAndLearn.listen': 'Escucha. Toma notas.',
  'event.lunchAndLearn.listen.0':
    'Es sobre todo respirar. Pero, hacia el minuto treinta, una frase es útil y te la apuntas en la mano. Algo de tu repertorio mejora.',
  'event.lunchAndLearn.sandwich': 'Coge los bocadillos y márchate.',
  'event.lunchAndLearn.sandwich.0': 'Pasas junto a la planta, que no dice nada. Los bocadillos son lo mejor que te ha pasado esta semana.',
  'event.lunchAndLearn.heckle': 'Pregunta cómo la resiliencia paga el alquiler.',
  'event.lunchAndLearn.heckle.0':
    'Silencio. Luego un aplauso, desde el fondo, y luego de todas partes. El Coach mira su diapositiva, que sigue diciendo RESPIRA, y respira.',
  'event.lunchAndLearn.heckle.1':
    'Te acompaña a la salida alguien que lo llama "una oportunidad para reflexionar". Los bocadillos se quedan donde están. La planta sonríe.',
  'event.reorg.title': 'La reorganización',
  'event.reorg.text':
    'De la noche a la mañana, cada mesa se ha movido un puesto a la izquierda. La tuya está ahora en un armario bajo un cartel que dice ALINEACIÓN ESTRATÉGICA. El Gestor del Cambio, en chándal dorado, tiene una palabra nueva: "pivotar".',
  'event.reorg.embrace': 'Abraza el cambio.',
  'event.reorg.embrace.0':
    'Dices "pivotar" con todo el pecho. Algo que cargabas desde hacía demasiado va a la trituradora como "legado". Te sientes más ligero, y un poco mareado.',
  'event.reorg.resist': 'Niégate a cambiar de mesa.',
  'event.reorg.resist.0':
    'Te quedas en la mesa vieja, que ahora es de otro. Eres, durante dos días, el problema. Atrincherado, tus métodos se afilan.',
  'event.reorg.negotiate': 'Negocia un sitio junto a la ventana.',
  'event.reorg.negotiate.0':
    'Consigues la ventana. Da a otra ventana. Llega un pequeño pago por "flexibilidad", que al parecer es algo que has hecho.',
  'event.bonus.title': 'Anuncio de bonificación',
  'event.bonus.text':
    'El VP Saliente reúne a todos para un anuncio. "¡Buenas noticias!", dice. "¡Hay una bonificación!" Aplausos. "Es una bonificación de... experiencia." Silencio. A alguien se le cae una grapadora.',
  'event.bonus.clap': 'Aplaude de todos modos.',
  'event.bonus.clap.0': 'Aplaudes con los demás. Como sensación es sorprendentemente cálida. El VP Saliente se inclina, ante nadie, y se va.',
  'event.bonus.ask': 'Pregunta qué es en realidad la bonificación.',
  'event.bonus.ask.0': 'Te mira largo rato. Luego abre un cajón y te da algo que era, en efecto, una bonificación de verdad, de cuando las había.',
  'event.bonus.ask.1': '"Experiencia", repite, y te presenta un formulario para describirla. El formulario tiene nueve páginas. La describes. Duele.',
  'event.bonus.bank': 'Ingresa la "experiencia" y márchate.',
  'event.bonus.bank.0':
    'La experiencia, resulta, es una moneda, si la gastas en el sitio adecuado. La gastas en el sitio adecuado. Algo tuyo está más afilado.',
  'event.lateNight.title': 'Reparto nocturno',
  'event.lateNight.text':
    'A las dos de la madrugada se abre el ascensor. Un repartidor, empapado, sostiene cuarenta pizzas que nadie ha pedido. "Va a su cuenta", dice. "A la cuenta de todos." No parpadea. Lleva aquí mucho tiempo.',
  'event.lateNight.eat': 'Come hasta no sentir nada.',
  'event.lateNight.eat.0': 'La pizza fría a las dos de la madrugada es un sacramento. Te comes tres porciones y quedas, brevemente, perdonado.',
  'event.lateNight.sell': 'Véndelas al turno de noche.',
  'event.lateNight.sell.0':
    'El turno de noche paga en billetes pequeños y grandes silencios. Al amanecer no quedan pizzas, y nadie recuerda un reparto.',
  'event.lateNight.ask': 'Pregunta quién las pidió.',
  'event.lateNight.ask.0':
    'El repartidor mira al techo, luego a ti. "Alguien que ya no está", dice, y te pasa algo por debajo de la caja. Está caliente.',
  'event.lateNight.ask.1': 'El techo te devuelve la mirada. No haces una segunda pregunta. Te zumban los oídos un rato.',
  'event.rooftop.title': 'La azotea',
  'event.rooftop.text':
    'Once pisos más arriba, toda la ciudad duerme salvo una ventana iluminada, como la tuya. Hay alguien que no fuma, fumando. "Vengo solo por las vistas", dice. "Las vistas son una ventana con más ventanas."',
  'event.rooftop.stay': 'Quédate un rato.',
  'event.rooftop.stay.0': 'El viento es lo primero en todo el día que no te pide nada. Te quedas hasta que tienes las manos frías y la cabeza no.',
  'event.rooftop.wave': 'Saluda a la otra ventana.',
  'event.rooftop.wave.0': 'Alguien dentro te devuelve el saludo. Muy lejos, pequeño, cansado. Es, te das cuenta, alguien exactamente como tú. Ayuda.',
  'event.rooftop.throw': 'Tira algo por el borde.',
  'event.rooftop.throw.0':
    'Una carta baja flotando a la oscuridad. No aterriza en ningún sitio. Te sientes más ligero que antes, y algo culpable por el tráfico.',
  'event.officeDog.title': 'Día del perro',
  'event.officeDog.text':
    'Hay un perro en la oficina. No es de nadie. Lleva una acreditación y una cara que sugiere que lo han contratado. Todos están contentos y nadie trabaja.',
  'event.officeDog.pet': 'Acaricia al perro.',
  'event.officeDog.pet.0': 'El perro se apoya en tu pierna con todo su peso. Es la relación más honesta que has tenido esta semana.',
  'event.officeDog.walk': 'Sácalo a pasear.',
  'event.officeDog.walk.0': 'Tiene opiniones firmes sobre las ardillas y la acera no está de tu parte. Un transeúnte te da propina, por el perro.',
  'event.officeDog.hire': 'Recomiéndalo para un ascenso.',
  'event.officeDog.hire.0': 'Lo ascienden a Jefe de Moral. En agradecimiento, te trae algo del fondo del almacén, moviendo la cola.',
  'event.salaryTalk.title': 'Charla salarial',
  'event.salaryTalk.text':
    'El Contable te recibe ahora. Hay una hoja de cálculo con tu nombre, que es también tu valor. "Los aumentos", dice, "son un estado de ánimo. El presupuesto no tiene mente."',
  'event.salaryTalk.ask': 'Pide un aumento.',
  'event.salaryTalk.ask.0': 'Suspira y toca una celda. La celda cambia. Es un pequeño milagro aritmético y no se repetirá.',
  'event.salaryTalk.ask.1': '"No", dice, con gran ternura. Te sale un sonido que debía ser una frase.',
  'event.salaryTalk.benefits': 'Pide beneficios en su lugar.',
  'event.salaryTalk.benefits.0': 'Un gimnasio, un seguro dental y una app que te recuerda beber agua. No sabes por qué, pero te sientes más robusto.',
  'event.salaryTalk.quit': 'Finge presentar tu dimisión.',
  'event.salaryTalk.quit.0':
    'Entra en pánico. Una contraoferta: algo del armario de cosas que se dan a quien podría irse. La mentira te cuesta, eso sí. No eres buen mentiroso.',
  'event.elevatorPitch.title': 'Discurso de ascensor',
  'event.elevatorPitch.text':
    'El Cliente VIP está atrapado en el ascensor contigo. No dice nada, y lo dice todo. El ascensor se mueve a la velocidad de una decisión. Tienes noventa segundos y una oportunidad piso a piso de que te recuerden.',
  'event.elevatorPitch.pitch': 'Da el discurso de tu vida.',
  'event.elevatorPitch.pitch.0': 'Cuarta planta: nada. Novena: una sonrisa. Undécima: apunta algo. Te pagan en apretones de manos y en lo de verdad.',
  'event.elevatorPitch.pitch.1': 'Dice "interesante" de una forma que cierra puertas. El resto del trayecto es un silencio que notas en los dientes.',
  'event.elevatorPitch.silence': 'No digas nada. Mira al frente.',
  'event.elevatorPitch.silence.0':
    'Él lo respeta. Os bajáis en plantas distintas, cada uno convencido de haber ganado. Es, al final, una forma de fuerza.',
  'event.elevatorPitch.card': 'Entrégale una tarjeta de visita.',
  'event.elevatorPitch.card.0': 'La lee dos veces, la dobla y te da la suya. La tuya solo dice tu nombre. La suya, a alguien que podrías usar.',
  'event.hrSurvey.title': 'Encuesta anónima',
  'event.hrSurvey.text':
    'La Responsable de Felicidad reparte una encuesta anónima. Cada copia está numerada. "¿Cómo de feliz eres?", pregunta. "Sé sincero." "La sinceridad", añade, "no es anónima."',
  'event.hrSurvey.lie': 'Marca "muy feliz" en todo.',
  'event.hrSurvey.lie.0':
    'Puntuación perfecta. Te invitan a una Comida de Cultura donde te pagan por ser feliz. Es, por fin, un trabajo en el que eres bueno.',
  'event.hrSurvey.honest': 'Di la verdad, completa.',
  'event.hrSurvey.honest.0':
    'Escribes toda la verdad en los márgenes. Ocupa cuatro páginas y se acaba el bolígrafo. Decirla te afila algo por dentro.',
  'event.hrSurvey.blank': 'Déjala en blanco.',
  'event.hrSurvey.blank.0':
    'Una encuesta en blanco también es una respuesta y, te dicen, un "patrón". Echas una siesta sobre el formulario, un buen montón grueso.',
  'event.internCoffee.title': 'Becario n.º 47',
  'event.internCoffee.text':
    'Una persona muy joven con una acreditación enorme lleva siete cafés y una impresora. "Perdone", dice. "¿En qué planta está Finanzas? ¿O Mantenimiento? ¿O Dios?" Lleva aquí tres días. Ya parece un fantasma.',
  'event.internCoffee.help': 'Llévale la impresora.',
  'event.internCoffee.help.0':
    'La impresora pesa más de lo debido. Te dan las gracias seis veces y apuntan tu nombre, como si fuera a servir. Te recordarán.',
  'event.internCoffee.ignore': 'Señala una planta al azar.',
  'event.internCoffee.ignore.0': '"La cuatro", dices. Van a la cuatro. La cuatro, piensas, es probablemente Mantenimiento. Probablemente.',
  'event.internCoffee.warn': 'Diles que se vayan mientras puedan.',
  'event.internCoffee.warn.0': 'Asienten con gravedad y lo apuntan. No se van. En cierto modo lo admiras. Un café se enfría en tu mano.',
  'event.internReturns.title': 'El becario regresa',
  'event.internReturns.text':
    'Las tres de la madrugada. El Becario del Cementerio, ya algo translúcido, te encuentra junto a la impresora. "Me quedé", dice. "Me nombraron Becario Emérito. Tengo una planta entera que embrujar." Ha guardado algo para ti de los cajones de los muertos.',
  'event.internReturns.take': 'Coge lo que guardó.',
  'event.internReturns.take.0':
    'Está un poco frío y algo de otra persona. Le han quitado el polvo. Alguien lo ha cuidado, algo que nadie ha hecho por nada en este edificio.',
  'event.internReturns.hug': 'Dales un abrazo (es sobre todo aire).',
  'event.internReturns.hug.0': 'Es sobre todo aire, y muy frío, y por un momento es lo más cálido de todo el edificio. Brillan un poco. Tú también.',
  'event.internReturns.advise': 'Diles que se vayan a casa. Ya.',
  'event.internReturns.advise.0':
    'La puerta del final del pasillo se abre a una calle tranquila, bajo la lluvia, durante exactamente un minuto. Lo miran todo el minuto. No van. Pero tú sí, un poco, en espíritu, y sales descansado.',
  'epilogue.internFriend.win': 'En la tercera planta, un becario muy translúcido archiva tu nombre bajo Emérito. Se le da bien archivar.',
  'epilogue.internFriend.lose': 'En la tercera planta, un becario muy translúcido sostiene una puerta para nadie, y sigue sosteniéndola.',
  'event.neighbourInvite.title': 'Pásate a la barbacoa',
  'event.neighbourInvite.text':
    'El Vecino del Soplador está en la valla con un plato de algo. "Deberías venir", dice. "Viene todo el mundo." Detrás de él, un jardín con siete personas, ninguna que hayas visto antes, todas saludando.',
  'event.neighbourInvite.go': 'Ve. Di que sí a todo.',
  'event.neighbourInvite.go.0':
    'Dices que sí a una salchicha, a la anécdota de un desconocido y a una segunda salchicha. Nadie te pregunta a qué te dedicas. Es, extrañamente, el cielo.',
  'event.neighbourInvite.lie': 'Di que estás ocupado.',
  'event.neighbourInvite.lie.0':
    'Dices que estás ocupado y, por un segundo, es verdad: estás ocupado en no querer ir. Asiente, dolido, y deja una salchicha en tu muro. Debajo hay dinero.',
  'event.neighbourInvite.complain': 'Pregunta por el soplador.',
  'event.neighbourInvite.complain.0':
    'Sigue un silencio largo y extraño. Luego te da el soplador. "Quédatelo", dice. "Ya no puedo ser ese hombre." No sabes qué has hecho.',
  'event.laundry.title': 'Día de colada',
  'event.laundry.text':
    'Un montón de ropa de trabajo en el sofá, más alto que ayer. En algún lugar del montón está la camisa que llevabas con el DJ de bodas. La lavadora zumba en la esquina, con la expresión de quien solo hace su trabajo.',
  'event.laundry.fold': 'Dóblalo todo, despacio.',
  'event.laundry.fold.0': 'Hay una calma al doblar que nadie te había contado. Al último calcetín eres, por un momento, una persona con un cajón.',
  'event.laundry.iron': 'Plancha la camisa buena. Por si acaso.',
  'event.laundry.iron.0':
    'Los lunes se deciden el domingo por la tarde, con una plancha. Planchas cada arruga hasta que queda plana y asustada. Algo de tu repertorio, en el mismo espíritu, se afila.',
  'event.laundry.ignore': 'Déjalo. Estará ahí el lunes.',
  'event.laundry.ignore.0':
    'Lo esquivas y te tumbas en el sofá, en la parte limpia. Bajo una manga encuentras una nota de un tú del pasado: "Perdón por esto."',
  'event.gymTrial.title': 'Prueba gratuita',
  'event.gymTrial.text':
    'El Gym Bro aparece a tu lado en la acera, como si llevara allí un rato. "Colega", dice. "Prueba gratuita. Una sesión. Sin datos de tarjeta." Sostiene un datáfono.',
  'event.gymTrial.train': 'Haz la sesión.',
  'event.gymTrial.train.0':
    'Sentadillas, sobre todo. Descubres músculos dormidos desde una vida anterior. Mañana será un ajuste de cuentas. Hoy eres poderoso.',
  'event.gymTrial.card': 'Firma el formulario (lee el formulario).',
  'event.gymTrial.card.0':
    'El formulario es un contrato de seis años con una cláusula de cancelación que debe ejercerse en persona, al amanecer, en una sucursal que ya no existe. Te frenas a tiempo.',
  'event.gymTrial.run': 'Corre. Con zapatos de trabajo.',
  'event.gymTrial.run.0':
    'Él está, de algún modo, delante de ti todo el rato, y sin faltarle el aire. En la esquina paras. Asiente, aprobando. Es el peor momento del día, y estás bien.',
  'event.weddingInvite.title': 'Acompañante',
  'event.weddingInvite.text':
    'Una invitación de boda, en un sobre grueso como un ladrillo. Eres el acompañante de alguien que no conoces, de una pareja que no conoces. El código de vestimenta dice "festivo", que no es un código sino una amenaza.',
  'event.weddingInvite.dance': 'Baila. Como Dios manda.',
  'event.weddingInvite.dance.0':
    'Tras tres canciones eres el centro de una conga y de un rumor. Tus rodillas lo recordarán el miércoles. Alguien te mete un sobre misterioso en el bolsillo.',
  'event.weddingInvite.bar': 'Quédate en la barra.',
  'event.weddingInvite.bar.0':
    'El camarero no pregunta nada y sirve bien. Te dicen que la novia llora, de felicidad, y el novio llora de la otra manera. Tú estás bien.',
  'event.weddingInvite.speech': 'Haz un brindis improvisado.',
  'event.weddingInvite.speech.0':
    'Usas la palabra "sinergia" en una boda. Nadie se ha emocionado nunca tanto. Te ascienden a invitado de honor y te dan una tarta.',
  'event.weddingInvite.speech.1':
    'Usas la palabra "sinergia" en una boda. Sigue un silencio sobre el que podrías sentarte. El padrino articula "no" con los labios y, luego, lo repite con los puños.',
  'event.motherCall.title': 'La llamada del domingo',
  'event.motherCall.text':
    'Tu teléfono muestra SUEGRA. Lo muestra desde hace once minutos. Es la única llamada de la historia que sonaba antes de empezar. Se oye una lasaña dentro.',
  'event.motherCall.answer': 'Contesta. Di que sí a todo.',
  'event.motherCall.answer.0':
    'Dura cincuenta y un minutos. Aceptas una comida, un sombrero, un médico. Al final dice algo casi amable. Te sientes terriblemente alimentado.',
  'event.motherCall.silence': 'Déjalo sonar.',
  'event.motherCall.silence.0':
    'Suena, paciente, el tiempo que haga falta. Se corta. Siete segundos después llega un mensaje: "He hecho demasiado." Con el tiempo, pagarás el silencio.',
  'event.motherCall.call': 'Llama con una excusa.',
  'event.motherCall.call.0':
    'La excusa es buena y ella cuelga antes de que termines. Un rato después llega un paquete, con una nota: "Estás muy flaco." Dentro, algo útil.',
  'compendium.gossip': 'Cotilleos',
  'compendium.gossipFound': 'Escenas oídas: {n} de {total}',
  'gossip.who': 'Contada por {name}',
  'gossip.cooler': 'Oída junto al dispensador de agua',
  'gossip.hero': 'Solo para {hero}',
  'gossip.chapter': 'Un capítulo de una historia',
  'intercom.morning7': 'Hoy es viernes informal. No es viernes. No es informal.',
  'intercom.morning8': 'Recuerden hidratarse. Hay agua disponible, en teoría.',
  'intercom.morning9': 'La nevera se limpiará el viernes. También se limpiará todo lo que ponga viernes.',
  'intercom.afternoon7': 'Se ha vaciado el buzón de sugerencias. Estaba más vacío de lo esperado.',
  'intercom.afternoon8': 'Recordatorio: la sala silenciosa es para el silencio. La sala silenciosa también está llena.',
  'intercom.afternoon9': 'Un amable recordatorio: "según mi último correo" es un lenguaje del amor.',
  'intercom.night6': 'Por favor, no alimenten las luces.',
  'intercom.night7': 'Han pasado los de la limpieza. No había nadie a quien limpiarle. Limpiaron igualmente.',
  'intercom.night8': 'Por favor, esperen. Su turno es importante para nosotros. También es el único que queda.',
  'intercom.weekend5': 'Es domingo. Siempre ha sido domingo. El lunes es un rumor.',
  'intercom.weekend6': 'El fin de semana se ha reprogramado para el próximo fin de semana. Despejen su calendario.',
  'intercom.afterBoss1': 'Enhorabuena por su turno. Aquí tiene el siguiente.',
  'intercom.lowHp3': 'Por favor, sangren sobre las baldosas, no sobre la moqueta.',
  'intercom.janitorFriend1': 'Un Conserje Nocturno me ha pedido que salude a alguien. No dijo a quién. Eres tú.',
  'intercom.newHireFriend1': 'Un nuevo empleado quiere dar las gracias a un compañero anónimo. Todos te estamos mirando.',
  'intercom.internFriend1': 'El becario n.º 47 ha sido visto en la cuarta planta. Por favor, no le devuelvan el saludo.',
  'relic.masterKeys.name': 'Llavero Maestro',
  'relic.masterKeys.d': 'Cada combate empieza con {n} credenciales perdidas: tus próximas {n} cartas que cuestan [mana] son gratis.',
  'relic.emeritusLanyard.name': 'Acreditación del Becario Emérito',
  'relic.emeritusLanyard.d': 'El maná vuelve un {n}% más rápido.',
  'event.orientation.title': 'Incorporación',
  'event.orientation.text':
    '¡Bienvenido a la familia! Tu primer día empieza con un vídeo corto, que es también el largo. Al terminar, el Vídeo de Bienvenida te ofrece varios paquetes de incorporación, cada uno envuelto, cada uno con un leve olor a tóner. Elige uno. Los demás irán a alguien más entusiasta.',
  'event.orientation.coffee': 'El paquete Café.',
  'event.orientation.coffee.0':
    'Un termo del tamaño de un niño y una taza que dice EL MÁS NORMALITO DEL MUNDO. Tu pulso es ya un rumor, pero tu maná nunca ha estado tan lleno.',
  'event.orientation.gym': 'El bono Gimnasio.',
  'event.orientation.gym.0': 'Un bono para un gimnasio que cerró en 2019. Te pones en forma por rencor, y el rencor te lleva lejos.',
  'event.orientation.laptop': 'El Portátil Bueno.',
  'event.orientation.laptop.0':
    'No es bueno. Solo es más nuevo que los demás. Una de tus herramientas aprende una macro, y una macro es una forma de poder.',
  'event.orientation.kit': 'El Kit de Bienvenida.',
  'event.orientation.kit.0':
    'Una bolsa de tela, una acreditación, una pegatina y, al fondo, algo que alguien claramente olvidó quitar. La bolsa te deja una marca en el hombro.',
  'event.orientation.declutter': 'El paquete Despeja.',
  'event.orientation.declutter.0': 'Una bolsa de basura y una pegatina motivacional: TÍRALO. Tiras algo y la pegatina, por una vez, tiene razón.',
  'event.orientation.bonus': 'La Prima de Fichaje.',
  'event.orientation.bonus.0': 'Algo raro y una pequeña factura. Firmas dos veces y llega una buena carta con el leve olor de un contrato sin leer.',
  'event.orientation.mentor': 'El Mentor.',
  'event.orientation.mentor.0': 'Tu mentor tiene dos años más que tú y lleva aquí desde siempre. Te enseña dos cosas y un arrepentimiento.',
  'event.orientation.humble': 'Rechaza todo, con humildad.',
  'event.orientation.humble.0':
    '"Vaya", dice el vídeo. "Un jugador de equipo." Nadie ha anotado nada tan rápido. Te apuntan como "de bajo mantenimiento", en un expediente que te sobrevivirá.',
  'event.fx.hpUp': 'Ganas {n} PV.',
  'event.fx.hpDown': 'Pierdes {n} PV.',
  'event.fx.heal': 'Recuperas {n} PV.',
  'event.fx.maxHpUp': 'Ganas {n} PV máximos.',
  'event.fx.maxHpDown': 'Pierdes {n} PV máximos.',
  'event.fx.payUp': 'Ganas {n} de paga.',
  'event.fx.payDown': 'Entregas {n} de paga.',
  'event.fx.relic': 'Coges un artículo de papelería al azar.',
  'event.fx.relicId': 'Coges: {name}.',
  'event.fx.card': 'Añade al mazo una carta al azar (rareza: {rarity}).',
  'event.fx.cardCross': 'Añade al mazo una carta al azar de cualquier clase (rareza: {rarity}).',
  'event.fx.upgrade': 'Mejora una carta a tu elección.',
  'event.fx.upgradeRandom': 'Mejora una carta al azar.',
  'event.fx.shred': 'Tritura una carta a tu elección.',
  'event.fx.crystal': 'Ganas un cristal de maná para siempre.',
  'event.fx.nothing': 'No pasa nada.',
  'event.fx.gamble': 'Una apuesta: ocurre una de estas cosas.',
  'event.fx.odds': '{pct}%: {what}',
  'event.fx.cantPay': 'No puedes permitírtelo ahora.',
  'condition.pizzaParty.name': 'Fiesta de pizza',
  'condition.pizzaParty.d': 'La pizza gratis arregla lo que rompe el día: te curas {n} PV cada poco.',
  'condition.unionDay.name': 'Día sindical',
  'condition.unionDay.d': 'El piquete está de tu lado: tienes {n} de [thorns].',
  'condition.nepotism.name': 'Nepotismo',
  'condition.nepotism.d': 'Hoy está el sobrino del jefe. El enemigo empieza con {n} de [strength].',
};
