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
};
