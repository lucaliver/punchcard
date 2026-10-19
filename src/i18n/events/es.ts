import type { eventsEn } from './en';

export const eventsEs: Record<keyof typeof eventsEn, string> = {
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
};
