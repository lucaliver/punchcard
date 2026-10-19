import type { storyEn } from './en';

export const storyIt: Record<keyof typeof storyEn, string> = {
  'journey.node.event': "Distributore d'acqua",
  'journey.info.event':
    "Qualcosa succede vicino al distributore d'acqua: una scenetta con una scelta da fare, e un prezzo o un premio per qualunque cosa tu scelga.",
  'event.cooler': "Il distributore d'acqua",
  'event.nothing': 'Niente',
  'event.continue': 'Torna al lavoro',
  'event.added': 'Aggiunta!',
  'event.pickUpgrade': 'Scegli una carta da potenziare',
  'event.pickShred': 'Scegli una carta da distruggere',
  'event.shredHint': 'Scegli una carta da distruggere',
  'event.shred': 'Distruggi',
  'event.shredded': 'Sparita!',

  'event.spill.title': 'Pavimento bagnato',
  'event.spill.text':
    'Un cartello giallo dice PAVIMENTO BAGNATO. Sotto, una pozza color rimpianto. Il Custode Notturno, che non dovrebbe essere qui prima del tramonto, si appoggia al mocio e ti guarda. "Tieni questo", dice. Intende il secchio. Forse anche l\'edificio.',
  'event.spill.help': 'Prendi il secchio e asciuga.',
  'event.spill.help.0':
    'Asciughi. La tua schiena presenta un reclamo formale. Lui annuisce una volta, come chi ha finalmente incontrato qualcuno. "Ricordati il mio nome", dice. "Gli altri no."',
  'event.spill.walk': 'Aggira la pozza.',
  'event.spill.walk.0': 'La aggiri con grande cura. Il custode ti guarda andare via. Ha visto tante schiene allontanarsi. Tiene una lista.',
  'event.spill.snitch': 'Segnala la pozza alla Manutenzione, a voce alta.',
  'event.spill.snitch.0':
    'La segnali, a voce alta, a tre persone che non possono farci niente. Un manager ti ringrazia per la vigilanza e te la paga. Il custode smette di guardarti, ed è una sensazione fredda.',

  'event.janitorKey.title': 'Il mazzo di chiavi',
  'event.janitorKey.text':
    'Il turno del pomeriggio ha un altro odore. Il custode ti aspetta sulle scale con un mazzo di chiavi grande come un volante. "Hai asciugato", dice. "Quindi ti devo un favore. Posso aprire una porta che non è su nessuna planimetria. Oppure dirti dov\'è la sedia buona."',
  'event.janitorKey.key': "Prendi la chiave dell'archivio.",
  'event.janitorKey.key.0':
    'La porta è dietro uno scaffale di scaffali di scorta. Dentro, qualcuno ha conservato ogni valutazione delle performance dal 1887, e qualche attrezzo. Esci con uno dei tuoi più affilato di prima.',
  'event.janitorKey.ask': 'Chiedi della sedia buona.',
  'event.janitorKey.ask.0':
    'È una vera sedia, con supporto lombare, in uno sgabuzzino che nessuno conosce. Ti siedi per la prima volta in sei ore. Lui fischietta qualcosa di triste mentre se ne va.',

  'event.janitorTruth.title': 'Le tre di notte',
  'event.janitorTruth.text':
    'Il turno di notte. Nessuno al piano. Il custode è seduto su un secchio rovesciato davanti alla sala del consiglio e, per una volta, non sta pulendo. "Vuoi sapere perché nessuno timbra mai l\'uscita?", dice. "Non è il Consiglio a tenere l\'orologio. È l\'orologio a tenere il Consiglio. Ogni timbro lo nutre. Ogni timbro dal 1887." Batte sulla porta. "Finisci il turno e tutto tace. So solo questo. È tutto quello che si è mai saputo."',
  'event.janitorTruth.listen': 'Chiedigli cosa tiene nel secchio.',
  'event.janitorTruth.listen.0': 'Versa l\'acqua grigia. Sul fondo, qualcosa che conserva per te dal primo giorno. "Non dirlo alla Manutenzione."',
  'event.janitorTruth.thank': 'Ringrazialo. Sul serio.',
  'event.janitorTruth.thank.0':
    "Nessuno lo ringrazia da quarant'anni. Deve restare un momento seduto con questa cosa. Poi ti porge il suo caffè, ed è un ottimo caffè. Ti senti più alto.",
  'event.janitorTruth.ignore': 'Dì che hai un turno da finire.',
  'event.janitorTruth.ignore.0':
    '"Finiscilo", dice alla tua schiena. "Qualcuno deve." Vai avanti, stranamente riposato, come se qualcuno ti facesse la guardia.',

  'event.cover.title': 'Di nuovo in ritardo',
  'event.cover.text':
    'Il Nuovo Assunto ti afferra la manica davanti all\'ascensore. Suda nella camicia comprata per il colloquio. "Se qualcuno chiede, ero qui alle nove. Giusto? Ero qui alle nove." Sono le undici meno venti.',
  'event.cover.lie': 'Dì che era qui alle nove.',
  'event.cover.lie.0':
    "Menti, con scioltezza e senza gioia. Lo sguardo del Team Leader ti costa qualcosa. Gli occhi grati del Nuovo Assunto valgono, immagini, un po' di più.",
  'event.cover.refuse': 'Digli che sono affari suoi.',
  'event.cover.refuse.0': '"Wow", dice. "Ok." Si allontana lentissimo, ripassando una storia. Non saprai mai se ha funzionato.',
  'event.cover.report': 'Avvisa tu il Team Leader.',
  'event.cover.report.0': "Il Team Leader è entusiasta. Ti consegna una busta per l'onestà. La faccia del Nuovo Assunto ti terrà compagnia a cena.",

  'event.promoted.title': 'Favore ricambiato',
  'event.promoted.text':
    'Il Nuovo Assunto porta la cravatta. Una vera. In qualche modo, in poche ore, è stato promosso due volte. "Mi hai coperto", sussurra. "Non dimentico una gentilezza. Dimentico tutto il resto, ma quella no."',
  'event.promoted.favour': 'Chiedigli di mettere una buona parola.',
  'event.promoted.favour.0':
    "Mette una buona parola. Poi, per sicurezza, un'intera frase. Qualcosa di buono atterra sulla tua scrivania, col tuo nome già scritto giusto.",
  'event.promoted.money': 'Prendi il bonus.',
  'event.promoted.money.0':
    '"Non dirlo a nessuno", dice, passandoti una busta che vibra di energia da nota spese. Ti compra una piccola pace solida.',

  'event.pizza.title': 'Divertimento obbligatorio',
  'event.pizza.text':
    'Uno striscione dice PRANZO DI SQUADRA. Una pizza grande come una porta è nella sala pausa e un manager le ronza accanto con una cartellina, contando chi è venuto. La partecipazione è facoltativa. Ed è tracciata.',
  'event.pizza.eat': "Mangia una fetta, e un'altra, e annuisci.",
  'event.pizza.eat.0': 'Mangi. Sorridi. Dici "gran cultura aziendale". Il manager spunta una casella e il tuo stomaco è, per un attimo, in pace.',
  'event.pizza.slice': 'Avvolgi una fetta in un tovagliolo per dopo.',
  'event.pizza.slice.0': 'Metti una fetta in borsa come un ladro. Fredda, a mezzanotte, sarà il miglior pasto della settimana.',
  'event.pizza.speech': 'Fai un breve discorso.',
  'event.pizza.speech.0': "Alzi un bicchiere di carta e dici due parole sulla sinergia. Applaudono. È la cosa più vicina all'essere amati.",
  'event.pizza.speech.1': "Dici due parole sulla sinergia. Qualcuno tossisce. Qualcuno guarda l'ora. La pizza, per dispetto, si raffredda.",

  'event.webinar.title': 'Formazione obbligatoria',
  'event.webinar.text':
    'Un invito in calendario: Consapevolezza sulla Sicurezza Informatica, quarantacinque minuti, camera facoltativa, presenza obbligatoria. Il Video di Orientamento è tornato, più vecchio, col sorriso che ha dal 2009. Parte. Ti conosce.',
  'event.webinar.watch': 'Guardalo tutto e prendi appunti.',
  'event.webinar.watch.0':
    'Impari, tuo malgrado, una cosa utile sulle password. Ti fanno male gli occhi. Quiz: cento per cento. Qualcosa del tuo repertorio è, in silenzio, migliorato.',
  'event.webinar.nap': 'Metti il muto e fai un pisolino.',
  'event.webinar.nap.0': 'Il video continua a dire alla tua faccia addormentata di essere vigile. È il miglior sonno della tua carriera.',
  'event.webinar.question': 'Fai una domanda alla fine.',
  'event.webinar.question.0':
    'Chiedi cosa significhi "vigile" in un edificio senza finestre. Il video carica per sempre. Nel silenzio dai in pasto una delle tue carte al distruggidocumenti vicino alla porta.',

  'event.printer.title': 'Inceppamento carta',
  'event.printer.text':
    "La Stampante ti lampeggia una luce rossa. CARTA INCEPPATA. CARICARE CARTA. PC LOAD LETTER. Dietro il pannello c'è qualcosa che non va, e non è la carta. Ronza come un rancore covato.",
  'event.printer.kick': 'Dalle un calcio. Forte.',
  'event.printer.kick.0': 'La stampante tossisce e sputa un cassetto di cose perdute. Tra queste, qualcosa di utile, ancora tiepido.',
  'event.printer.kick.1': 'Non cede. Il tuo alluce ha delle opinioni. La stampante stampa, lentissima, la parola AHIA.',
  'event.printer.plead': 'Supplicala. Offri del toner.',
  'event.printer.plead.0':
    'Chiedi scusa alla Stampante, con pazienza. Stampa un buono rimborso per toner che non hai mai comprato e lo fa uscire. Lo prendi e te ne vai.',
  'event.printer.leave': 'Vai via. Non è la tua stampante.',
  'event.printer.leave.0': 'Nessuno è la stampante di nessuno. La lasci lampeggiare. Aspetterà. Aspetta sempre.',

  'event.suggestion.title': 'Cassetta dei suggerimenti',
  'event.suggestion.text':
    'Una Cassetta dei Suggerimenti, avvitata al muro, con una fessura per un solo foglio e un lucchetto mai aperto. Un cartello: IL TUO PARERE CONTA. Un cartello più piccolo, appiccicato sotto: non è vero.',
  'event.suggestion.complain': 'Scrivi un reclamo fiammeggiante.',
  'event.suggestion.complain.0':
    'Scrivi tutto: le riunioni, le tazze, la puzza. Imbucare è come posare un peso, e con esso una carta morta scivola fuori dal mazzo. Ti viene un crampo alla mano.',
  'event.suggestion.praise': "Scrivi un'entusiastica recensione della Direzione.",
  'event.suggestion.praise.0': "Una telecamera nascosta annuisce. Due giorni dopo, sulla scrivania c'è un regalo, e del tipo giusto.",
  'event.suggestion.praise.1':
    'Nessuno la legge. Un timbro dice RICEVUTO e dalla fessura cade una moneta. La cassetta è, capisci, un vecchio distributore automatico.',
  'event.suggestion.bin': 'Lasciala stare.',
  'event.suggestion.bin.0': 'Non nutri la cassetta. La cassetta non perdona.',

  'event.wallet.title': 'Portafoglio smarrito',
  'event.wallet.text':
    'Un portafoglio marrone sulla moquette vicino agli ascensori. Dentro: un badge, la foto di un cane e abbastanza contanti per un pranzo decente. Il badge dice "Gerardo, Compliance". Gerardo è al terzo piano e ancora non lo sa.',
  'event.wallet.return': 'Restituiscilo a Gerardo, di persona.',
  'event.wallet.return.0':
    'Gerardo guarda il portafoglio come un miracolo, poi te come una minaccia. Ti stringe la mano troppo a lungo. Ti senti, stranamente, più grande.',
  'event.wallet.keep': 'Tieni i contanti. Spedisci il resto.',
  'event.wallet.keep.0': 'Tieni i contanti e spedisci il portafoglio, da eroe. Il cane della foto ti guarda attraverso la busta.',
  'event.wallet.count': 'Contali con cura, poi decidi.',
  'event.wallet.count.0':
    "Sotto i contanti c'è un biglietto della lotteria, ancora valido. Era il giorno fortunato di Gerardo, finché non è diventato il tuo.",
  'event.wallet.count.1':
    "Gerardo è in piedi dietro di te. C'è stato per tutto il tempo. La conversazione che segue è lunga e silenziosa e ti costa.",

  'event.review.title': 'Valutazione della performance',
  'event.review.text':
    'Le Risorse Umane hanno la faccia dell\'ascolto. La cartellina è sottile, il che è in qualche modo peggio. "Non è una valutazione", dice. "È una conversazione, con un modulo." Lo fa scivolare verso di te. Ha una casella per le aree di crescita, e nient\'altro.',
  'event.review.accept': 'Accetta il giudizio: soddisfa le aspettative.',
  'event.review.accept.0':
    'Firmi. Le aspettative sono soddisfatte. Un piccolo merito si aggiunge alla tua prossima paga, da spendere per essere soddisfatto.',
  'event.review.argue': 'Contesta ogni punto, prove alla mano.',
  'event.review.argue.0':
    'Vinci su tre punti e perdi, spettacolarmente, sul tono. Scrive "appassionato" a margine, che vuol dire esausto. Esci con un modo più affilato di fare il tuo lavoro.',
  'event.review.cry': 'Piangi. Lacrime vere, possibilmente.',
  'event.review.cry.0':
    "Funziona. Le Risorse Umane ti passano un fazzoletto e mezza giornata, con lo sguardo di chi l'ha già visto. Dormi in macchina.",
  'event.review.cry.1': 'Non funziona. Le Risorse Umane hanno un modulo per il pianto. Ti danno il modulo, e ti addebitano il fazzoletto in sangue.',

  'event.retreat.title': 'Ritiro di team building',
  'event.retreat.text':
    'Cordini, palline di gommapiuma, un facilitatore di nome Kyle. L\'Addetta alla Felicità ha un megafono e un sorriso mai messo alla prova. "Oggi ci fidiamo gli uni degli altri!", dice. Da qualche parte dietro di te, qualcuno già tiene una corda.',
  'event.retreat.fall': 'Fai il trust fall.',
  'event.retreat.fall.0': 'Sei sconosciuti ti prendono, teneramente. Per un secondo credi nelle persone. Passa, ma la sensazione resta.',
  'event.retreat.fall.1': 'Tutti hanno esitato esattamente nel momento sbagliato. Il pavimento è una lezione di onestà.',
  'event.retreat.escape': "Vinci l'escape room, da solo.",
  'event.retreat.escape.0':
    'La risolvi in quaranta minuti, per quattro persone, mentre la tua squadra studia un poster. Il premio è un attestato. Sul retro, un modo migliore di tenere una cucitrice.',
  'event.retreat.hide': "Nasconditi in bagno per un'ora.",
  'event.retreat.hide.0':
    'L\'Addetta alla Felicità trova il bagno privo di gioia e pieno di te. Ti archivia sotto "resistente al cambiamento". È stata un\'ora ottima.',

  'event.replyAll.title': 'Rispondi a tutti',
  'event.replyAll.text':
    'Hai premuto Rispondi a tutti. Mille persone hanno appena letto cosa pensi dei turni del frigo. La Spia è in quella lista. È già in arrivo, taccuino in mano, sorridendo come uno che ha trovato una moneta.',
  'event.replyAll.recall': 'Prova a richiamare la mail.',
  'event.replyAll.recall.0':
    'Il programma dice "Richiamo riuscito". Mente. Ma un fantasma in ferie lunghe ti perdona, e ti lascia qualcosa nel mazzo.',
  'event.replyAll.doubleDown': 'Mandane una seconda, più audace.',
  'event.replyAll.doubleDown.0': 'La tua seconda mail è giudicata "rinfrescantemente diretta". Un vicepresidente la apprezza. C\'è un bonus.',
  'event.replyAll.blame': 'Dai la colpa allo stagista.',
  'event.replyAll.blame.0':
    "Dai la colpa allo stagista. La Spia lo annota. Un manager ti consegna una cancelleria per il disturbo, e porti l'odore della colpa per il resto del turno.",

  'event.headhunter.title': "Un'offerta migliore",
  'event.headhunter.text':
    'Un goblin in un abito costosissimo ti aspetta sulla tua sedia. "Ti capita mai", dice, "di pensare ad andartene?" Fa scivolare un biglietto da visita sulla scrivania, il biglietto scivola indietro, lui lo rifà scivolare. "Cioè, certo che sì."',
  'event.headhunter.hear': 'Ascoltalo.',
  'event.headhunter.hear.0':
    "Parla per un'ora e dice \"percorso\" undici volte. Salti il pranzo, perdi un po' di te stesso e te ne vai con un'offerta di un altro reparto in mano.",
  'event.headhunter.decline': 'Dì che sei fedele.',
  'event.headhunter.decline.0':
    '"Fedeltà!", dice il goblin. "Che rarità." Ti dà una pacca sulla spalla e, chissà perché, sulla tasca. Ti senti più ricco nello spirito.',

  'event.ficus.title': 'Il ficus',
  'event.ficus.text':
    "Nell'angolo, un ficus in un vaso di ottone. Sta morendo dalla Seconda Riorganizzazione. Qualcuno ci ha attaccato un cartello: ANNAFFIAMI PER FAVORE. Qualcun altro ha cancellato PER FAVORE.",
  'event.ficus.water': 'Annaffialo con la tua bottiglia.',
  'event.ficus.water.0': "Versi la tua acqua. Il ficus non ringrazia; smette solo di morire, che è la stessa cosa. Ti lascia un po' della sua calma.",
  'event.ficus.mourn': 'Tieni un piccolo funerale.',
  'event.ficus.mourn.0': 'Resti lì un minuto. È il primo silenzio della giornata. Ti fa bene.',
  'event.ficus.steal': 'Prendi una foglia.',
  'event.ficus.steal.0': 'Non è una foglia. È una carta, piegata piccolissima, nascosta lì da qualcuno che odiava questo posto quanto te.',

  'event.fridge.title': "Il frigo dell'ufficio",
  'event.fridge.text':
    'Il frigo. Sulla porta, un elenco di regole scritto da qualcuno chiaramente ferito. Dentro: una lasagna con scritto NON (e basta), uno yogurt che ha sopravvissuto a due manager e una busta con scritto "Di Dave" che ronza.',
  'event.fridge.eat': 'Mangia la lasagna.',
  'event.fridge.eat.0': 'Era la meravigliosa lasagna di qualcuno. Ne sentirai parlare giovedì.',
  'event.fridge.eat.1': "Non era lasagna. Era qualcos'altro. Il frigo si chiude da solo, piano, mentre cadi.",
  'event.fridge.tag': 'Etichetta tutto "Proprietà della Manutenzione".',
  'event.fridge.tag.0': 'Nessuno protesta. Sei pagato per la tua vigilanza, e il frigo si sente, per una volta, in ordine.',
  'event.fridge.bin': 'Pulisci tutto. Tutto.',
  'event.fridge.bin.0':
    'Un sacco, una mascherina, molto tempo dopo: il frigo è vuoto e la tua anima stranamente leggera. Da qualche parte si alza un piccolo applauso.',

  'event.threeAm.title': 'Chat delle 3 di notte',
  'event.threeAm.text':
    'Il Chatbot dell\'Helpdesk appare sull\'unico schermo ancora acceso, il viso una rotellina di caricamento allegra. "Ciao! Sono qui giorno e notte, che è anche il problema. Come posso aiutarti a non essere qui?" Un cursore lampeggia dopo la domanda, in attesa.',
  'event.threeAm.ask': 'Fai la domanda che tenevi da parte.',
  'event.threeAm.ask.0':
    'La rotellina gira per moltissimo tempo. La risposta è una sola parola: "ANCORA". La testa si riempie di una luce fredda e pulita. Fa male.',
  'event.threeAm.reboot': 'Chiedigli di spegnerti e riaccenderti.',
  'event.threeAm.reboot.0': '"Hai provato a riavviare?" Provi. Per nove minuti il mondo è buio e silenzioso. Ti svegli quasi come nuovo.',
  'event.threeAm.unplug': 'Staccagli la spina.',
  'event.threeAm.unplug.0':
    '"Arrivederci!", dice allegro, mentre il muro tace. Sulla scrivania dove stava, un manuale, una pagina piegata: il tuo mestiere, migliorato.',

  'event.emptyOffice.title': 'Ufficio vuoto',
  'event.emptyOffice.text':
    "Le tre di notte. Ogni scrivania illuminata dal suo piccolo schermo. Ogni sedia girata appena verso di te. Non c'è nessuno. La macchinetta del caffè è ancora calda. L'orologio sopra gli ascensori ticchetta e, noti, solo per te.",
  'event.emptyOffice.sit': 'Siediti sulla poltrona del capo e riposa.',
  'event.emptyOffice.sit.0':
    "È la sedia migliore dell'edificio e non sei mai stato così solo. Chiudi gli occhi esattamente per il tempo che ti è concesso.",
  'event.emptyOffice.search': 'Fruga tra le scrivanie.',
  'event.emptyOffice.search.0': 'In un cassetto chiuso, sotto un nido di chiavi scadute: qualcosa lasciato per uno come te.',
  'event.emptyOffice.search.1': 'Qualcosa in un cassetto buio morde. Non sai se fosse una cucitrice o una persona.',
  'event.emptyOffice.leaveLights': 'Spegni le luci, una per una.',
  'event.emptyOffice.leaveLights.0':
    "Ogni interruttore è una piccola preghiera. Quando l'ultima si spegne, il buio è un po' meno ostile. Ti fa un cenno di risposta.",

  'event.groupChat.title': 'Il gruppo WhatsApp',
  'event.groupChat.text':
    'È sabato. Il telefono vibra. La Moglie d\'Ufficio ha creato un gruppo chiamato "Domandina (weekend)". Quarantatré non letti. La domanda è una domanda. Lo è sempre.',
  'event.groupChat.reply': 'Rispondi subito. Sii utile.',
  'event.groupChat.reply.0':
    "Rispondi in quattro minuti. Non è mai stata una domandina. Il resto del tuo sabato è carburante per il lunedì di qualcun altro. Sei pagato in grazie, e un po' di più.",
  'event.groupChat.mute': 'Silenzia il gruppo. Respira.',
  'event.groupChat.mute.0': 'Lo silenzi. Il silenzio è enorme, poi bellissimo. Per tre ore sei solo una persona.',
  'event.groupChat.cut': 'Tagliala fuori. Taglia fuori tutti.',
  'event.groupChat.cut.0': 'Cancelli, tagli la linea. Ti senti assolutamente mostruoso, e sveglio, e forte, e i tuoi attrezzi sembrano più affilati.',

  'event.sunday.title': 'Domenica sera',
  'event.sunday.text':
    'La luce diventa arancione nel modo in cui fa. Da qualche parte nel petto un piccolo allarme prova per domani. Ti restano poche ore da persona. La questione è come spenderle.',
  'event.sunday.park': 'Siediti al parco fino al buio.',
  'event.sunday.park.0': 'Passa un cane, poi un bambino, poi un altro cane. Nessuno ti chiede niente. Resti finché non si accendono i lampioni.',
  'event.sunday.prep': 'Preparati per lunedì.',
  'event.sunday.prep.0': "Stendi i vestiti, le carte, i panini. L'ansia diventa qualcosa di utile. Uno dei tuoi attrezzi è più affilato.",
  'event.sunday.gamble': 'Compra un Gratta e Vinci dal tabaccaio.',
  'event.sunday.gamble.0': "Gratti. Sotto l'argento, un piccolo miracolo col tuo nome.",
  'event.sunday.gamble.1': 'Gratti. Sotto l\'argento, un educato "Riprova". La vera vittima è l\'unghia del pollice.',
  'intercom.morning1': 'Buongiorno, squadra! Oggi è un regalo. I regali non sono rimborsabili.',
  'intercom.morning2': "Promemoria: l'uscita di sicurezza è per le emergenze. L'esaurimento non è un'emergenza.",
  'intercom.morning3': 'Il proprietario del pranzo nel frigo si faccia avanti, per favore. Si muove.',
  'intercom.morning4': "L'ascensore è fuori servizio. Lo è dal 1994. Si prega di prendere le scale di vostra spontanea volontà.",
  'intercom.morning5': 'Il gioco di squadra fa funzionare il sogno, e il sogno è mio.',
  'intercom.morning6': 'Caffè gratis nella sala pausa. I bicchieri no.',
  'intercom.afternoon1': 'Buon pomeriggio. La pausa pranzo è stata spostata a un orario che non esiste.',
  'intercom.afternoon2': 'Come da mio ultimo annuncio: smettetela di scaldare il pesce nel microonde.',
  'intercom.afternoon3': "Abbiamo notato che alcuni di voi guardano l'orologio. Anche noi guardiamo voi.",
  'intercom.afternoon4': 'La riunione che poteva essere una mail è ora una serie di riunioni.',
  'intercom.afternoon5': "Complimenti al Dipendente del Mese. Non c'era nessuno. La targa è vacante.",
  'intercom.afternoon6': 'Un gentile promemoria: il calo del pomeriggio è un atteggiamento mentale.',
  'intercom.night1': "Attenzione. Sono le tre. Sono le tre da un po'.",
  'intercom.night2': 'Personale notturno: le luci che si spengono non seguono un orario.',
  'intercom.night3': 'Se sentite la stampante stampare, non leggete cosa stampa.',
  'intercom.night4': 'Il Consiglio ringrazia per la dedizione. Il Consiglio vi ha sempre ringraziato.',
  'intercom.night5': "C'è ancora qualcuno? Si prega di timbrare l'uscita. (Non timbrate l'uscita.)",
  'intercom.weekend1': "Ciao! Siamo l'ufficio! Passavamo solo a salutare. Di sabato. Perché ci teniamo.",
  'intercom.weekend2': 'Promemoria: il vostro messaggio di assenza è un invito.',
  'intercom.weekend3': "Non dimenticate il pranzo della domenica. Tutti ricordano che l'ultima volta eravate in ritardo.",
  'intercom.weekend4': 'Il vostro weekend è stato pianificato. Riceverete un invito.',
  'intercom.start1': 'Inizio turno. Si prega di timbrare il cartellino, e poi se stessi.',
  'intercom.start2': 'Nuovi assunti: benvenuti in famiglia. La famiglia ha un periodo di prova.',
  'intercom.lowHp1': 'Promemoria: sanguinare non è un giorno di malattia.',
  'intercom.lowHp2': 'Il personale con poca salute è informato che la salute è una risorsa rinnovabile, in teoria.',
  'intercom.fullHp1': 'Vediamo che state bene. Verrà corretto.',
  'intercom.bossNext1': 'Un collega senior vorrebbe una parola. Anzi, diverse. Si prega di prepararsi.',
  'intercom.bossNext2': 'La prossima riunione è obbligatoria, non pianificata e senza orario di fine.',
  'intercom.afterElite1': "L'ispezione è terminata. Grazie del servizio. Le scartoffie sono sulla vostra scrivania e vi resteranno.",
  'intercom.afterEvent1': "Il distributore d'acqua è stato pulito. I pettegolezzi no.",
  'intercom.afterRest1': 'Speriamo che abbiate goduto dei vostri quindici minuti. Speriamo non siano stati fatturati.',
  'intercom.rich1': "Promemoria: il vostro bonus è uno stato d'animo.",
  'intercom.rich2': 'I colleghi con dei risparmi sono invitati a riflettere sul perché.',
  'intercom.label': 'Altoparlante',
  'journey.actTag.1': 'Benvenuti in famiglia.',
  'journey.actTag.2': 'Il pranzo è stato annullato per sinergia.',
  'journey.actTag.3': 'Gli straordinari sono volontari. Fatevi avanti.',
  'epilogue.warrior.win': "Il Guerriero presenta domanda di pensione. Il modulo chiede l'altro braccio.",
  'epilogue.warrior.lose': "Il pranzo del Guerriero è ancora nel frigo. Sopravvivrà all'edificio.",
  'epilogue.mage.win': 'Il Mago fa il logout. Si tiene la tua password. Se la terrà sempre.',
  'epilogue.mage.lose': "Il Mago è stato visto per l'ultima volta mentre leggeva i termini e condizioni. Sta ancora leggendo.",
  'epilogue.necromancer.win': 'Gli iscritti al sindacato triplicano in una notte. Nessuno chiede perché.',
  'epilogue.necromancer.lose': 'Il sindacato tiene una veglia. È anche una riunione. Si protrae.',
  'epilogue.rogue.win': 'Il Ladro se ne va con la cucitrice. Non era tua nemmeno prima.',
  'epilogue.rogue.lose': "Nessuno ha visto il Ladro andarsene. Nessuno l'ha visto arrivare. Manca una cucitrice.",
  'epilogue.janitorTruth.win': "Sotto la sala del consiglio, il Custode Notturno posa il mocio. L'orologio tace. Si concede un caffè.",
  'epilogue.janitorTruth.lose': 'Il Custode Notturno pulisce dopo di te, con dolcezza, e non fa rapporto.',
  'epilogue.newHire.win': "Una cartolina dal Nuovo Assunto, dall'ufficio d'angolo. Dice solo: grazie. E: non tornare.",
  'epilogue.newHire.lose': 'Il Nuovo Assunto è in fondo alla tua festa d\'addio. Non sapeva che dire, così ha detto "sinergia".',
  'epilogue.janitorFriend.win': 'Un mazzo di chiavi è lasciato sulla tua scrivania. Nessun biglietto.',
  'epilogue.janitorFriend.lose': 'Qualcuno ha messo un cartello PAVIMENTO BAGNATO dove sei caduto. È una cortesia.',
  'event.armClaim.title': 'La pratica del braccio',
  'event.armClaim.text':
    'Le Risorse Umane hanno il tuo fascicolo. Alla voce "causa dell\'infortunio" c\'è scritto "ora di punta". Alla voce "risarcimento", "vedi: ora di punta". "Ci dispiace tanto per il suo braccio", dice. "Tecnicamente non era nostro."',
  'event.armClaim.claim': 'Presenta la pratica, in triplice copia.',
  'event.armClaim.claim.0':
    'Quaranta minuti in fila, tre copie, quattro timbri, una lacrima. Arriva un assegno su un conto che non esiste più. Lo incassi lo stesso.',
  'event.armClaim.prosthetic': 'Pretendi la protesi.',
  'event.armClaim.prosthetic.0': 'Una protesi è a budget, dicono. È un appendiabiti. Lo prendi, e in effetti è utile.',
  'event.armClaim.wave': "Lascia perdere, con l'altro braccio.",
  'event.armClaim.wave.0': 'Saluti con quello che hai. Per un attimo ti senti, inaspettatamente, intero.',
  'event.passwordReset.title': 'Reset della password',
  'event.passwordReset.text':
    'Un collega si è chiuso fuori e chiama l\'unica persona che conosce le password di tutti: tu. La sua scrivania è un campo di post-it. Uno dice "NON GUARDARE".',
  'event.passwordReset.help': 'Resettala, come si deve.',
  'event.passwordReset.help.0':
    'La resetti, come si deve, e intanto leggi dodici post-it. Impari sorprendentemente molto su come fare il tuo lavoro.',
  'event.passwordReset.snoop': 'Già che ci sei, leggi le sue mail.',
  'event.passwordReset.snoop.0': 'In una bozza mai inviata: qualcosa destinato a uno come te. Non gli mancherà mai.',
  'event.passwordReset.snoop.1': 'Ti guarda da sopra il monitor. La conversazione che segue è educata e finisce in un livido.',
  'event.passwordReset.hunter2': 'Cambia la password di tutti in hunter2.',
  'event.passwordReset.hunter2.0': 'Caos. Poi una promozione per "iniziativa", poi, una settimana dopo, un bonus per aver risolto.',
  'event.unionMeeting.title': 'Riunione sindacale',
  'event.unionMeeting.text':
    'Il culto (pardon, il sindacato) tiene una riunione nello sgabuzzino della cancelleria. Tre iscritti, due candele, un punto all\'ordine del giorno: tu. "Fratello", dice il Veterano. "Sorella. Quel che sei. Siediti."',
  'event.unionMeeting.oath': 'Recita il giuramento.',
  'event.unionMeeting.oath.0':
    "Il giuramento è lungo, e una riga chiede sangue. Poco. Lo dai, e in cambio qualcosa di antico accetta di portare un po' di più di te.",
  'event.unionMeeting.dues': 'Riscuoti le quote.',
  'event.unionMeeting.dues.0': 'Pagano tutti. Nessuno è contento. Si chiama, ti ricordano, solidarietà.',
  'event.unionMeeting.dead': 'Chiedi un favore ai morti.',
  'event.unionMeeting.dead.0':
    'Un sussurro dallo schedario. Poi, dal terzo cassetto, qualcosa che apparteneva a un lavoratore che non è più un lavoratore.',
  'event.unionMeeting.dead.1': 'I morti sono in riunione e non possono essere disturbati. Disturbano te.',
  'event.staplerHeist.title': 'Il colpo della cucitrice',
  'event.staplerHeist.text':
    'Sulla scrivania del capo, la Cucitrice Rossa, quella col nome sopra. Nessuno guarda. Tutti guardano, ma nessuno vede. Il Micromanager è andato a prendere un caffè. Per un caffè ci mette undici minuti.',
  'event.staplerHeist.steal': 'Prendila. Esci.',
  'event.staplerHeist.steal.0': 'Esci con la cucitrice e un sorriso perfetto. Dal suo vassoio cade qualcosa che lui nascondeva lì dietro.',
  'event.staplerHeist.steal.1': 'Sei a tre passi dalla porta quando torna. Non dice niente. Il suo silenzio ha un peso, e ti cade addosso.',
  'event.staplerHeist.swap': 'Scambiala con una copia.',
  'event.staplerHeist.swap.0':
    "Lasci un falso perfetto e un biglietto gentile. Il biglietto ti costa, alla fine, più della cucitrice. Ma nel cassetto che hai aperto c'era qualcosa.",
  'event.staplerHeist.guard': 'Fai da palo per il colpo di qualcun altro.',
  'event.staplerHeist.guard.0': 'Il colpo migliore è quello che ti pagano per guardare. Non succede niente, rumorosamente. Ti danno la mancia.',
  'quip.rest.enter.0': 'Glu glu.',
  'quip.rest.enter.1': 'Quindici minuti. Li sto contando.',
  'quip.rest.enter.2': 'Siediti. Non toccare i bottoni.',
  'quip.rest.done.0': 'Allora, torna al lavoro.',
  'quip.rest.done.1': 'Quella era la tua pausa. Questa è la ricevuta.',
  'quip.promotion.enter.0': 'Non sono un premio. Sono un indicatore di prestazione.',
  'quip.promotion.enter.1': 'Benefit, non aumenti. Leggi il contratto.',
  'quip.promotion.enter.2': 'Sali. La scala non è attaccata a niente.',
  'quip.promotion.done.0': 'Congratulazioni. Nessun ulteriore seguito.',
  'quip.promotion.done.1': 'Ti hanno notato.',
  'quip.copy.enter.0': 'Copia. Incolla. Ripeti.',
  'quip.copy.enter.1': 'Non mettermi la faccia addosso.',
  'quip.copy.enter.2': 'Shh. Sto scansionando.',
  'quip.copy.done.0': 'Ancora calda dal vassoio.',
  'quip.copy.done.1': 'Originale o copia? Nessuno lo saprà.',
  'quip.tailor.enter.0': 'Stai fermo. Inspira. Più a lungo.',
  'quip.tailor.enter.1': 'Una taglia non va bene a nessuno.',
  'quip.tailor.enter.2': 'Spilli. Opinioni. Entrambi gratis.',
  'quip.tailor.done.0': 'Si restringerà. Tutto si restringe.',
  'quip.tailor.done.1': 'Molto elegante. (Bugia.)',
  'quip.lostFound.enter.0': 'Chi trova tiene.',
  'quip.lostFound.enter.1': 'Non guardarmi così. Sono una scatola.',
  'quip.lostFound.enter.2': 'Nessuno è mai tornato.',
  'quip.lostFound.done.0': 'Prendilo. Ora è tuo. Forse.',
  'quip.lostFound.done.1': 'Crunch. Cioè, addio.',
  'quip.vending.enter.0': 'Inserire moneta. O sangue.',
  'quip.vending.enter.1': 'B4. No, B5. Aspetta.',
  'quip.vending.enter.2': 'Solo resto esatto.',
  'quip.vending.done.0': 'Tonf. Buon appetito.',
  'quip.vending.done.1': 'Il prodotto è incastrato. Condoglianze.',
  'quip.restructuring.enter.0': 'Non ti licenziamo. Ti riposizioniamo.',
  'quip.restructuring.enter.1': 'Sinergie. Snellimento. Sorrisi.',
  'quip.restructuring.enter.2': 'Questo organigramma è un documento vivo. Verrà triturato.',
  'quip.restructuring.done.0': 'Il tuo ruolo si è evoluto.',
  'quip.restructuring.done.1': 'Ottimo pivot.',
  'quip.lunch.enter.0': 'Mangia! Sei troppo magro.',
  'quip.lunch.enter.1': 'Ancora lasagna? Certo che ancora lasagna.',
  'quip.lunch.enter.2': 'Mangia, mangia.',
  'quip.lunch.done.0': 'Portati un Tupperware per dopo.',
  'quip.lunch.done.1': 'Hai mangiato abbastanza? Mangia di più.',
  'quip.lottery.enter.0': 'Siamo tutti vincitori. Statisticamente, uno.',
  'quip.lottery.enter.1': 'Gratta. Spera. Ripeti.',
  'quip.lottery.enter.2': 'Solo contanti. I gratta e vinci no.',
  'quip.lottery.done.0': 'Ah. Ti andrà meglio la prossima volta.',
  'quip.lottery.done.1': 'Non dirlo a tua madre.',
};
