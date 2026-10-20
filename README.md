# Hyakki

Un **deckbuilder roguelike in tempo reale, a corsie**, per browser mobile in verticale. Versione alternativa e interamente
rifatta del gioco di questo repository (*Punchcard*, che vive su `master`): stesso stack, tutto il resto è nuovo.

> Questo branch (`alt/hyakki`) non tocca `master`. Panoramica per chi gioca e per chi sviluppa; la parte tecnica è in
> [CLAUDE.md](CLAUDE.md), le regole e il piano in [docs/DESIGN.md](docs/DESIGN.md).

**Avvio rapido:** `npm install`, poi `npm run dev` (apribile anche dal telefono sulla stessa Wi-Fi).

---

## 1. Il gioco in breve

Ogni notte d'estate la **Parata dei Cento Demoni** (Hyakki Yagyō) scende lungo la strada della montagna. Sei un **custode
della lanterna**: la porti in cima, notte dopo notte, e devi tenerne viva la fiamma fino all'alba. Per farlo evochi **spiriti
amici** (kodama, volpi, tanuki, oggetti che si sono svegliati) e stendi **talismani** lungo la strada.

- **Un campo a corsie, visto dall'alto.** 5 corsie × 7 righe: la parata entra dall'alto, la lanterna è in basso. Un nemico
  che la raggiunge costa **fiamma** (la tua vita) e sparisce. Resisti fino all'**alba** (un timer) o ripulisci prima la strada.
- **Carte in tempo reale.** Una mano di 4 carte che si rimpiazzano da sole; le carte costano **olio**, che si ricarica col
  tempo. Trascina una carta sul giardino, oppure toccala e poi tocca una casella. Tenere premuto legge qualunque cosa.
  - **Spiriti**: stanno su una casella e fermano, colpiscono, curano, producono olio, potenziano i vicini…
  - **Talismani**: magie una tantum, su una corsia, su una casella o su tutto il campo.
  - **Fusione**: giocare uno spirito sul suo gemello li fonde (livello 2, poi 3): più forte e curato del tutto. Tenere premuto uno
    spirito sul campo lo legge e permette di rimandarlo indietro (metà dell'olio).
- **Nemici sempre telegrafati.** Una lanterna rossa appare in cima alla corsia due secondi prima che un nemico entri; i
  boss avvisano le mosse grosse (schiacciare una corsia, una raffica).
- **Il custode** ha una passiva e un'abilità con ricarica (la campana di Hanae, il taglio di Ichi, il rimescolo di Bunbuku).
- **Caselle speciali**: rocce (non ci si costruisce) e altari (uno spirito sopra lavora più forte).

### La salita

Tre notti — **la strada del villaggio**, **il bambù e la palude**, **le scale del santuario** — ognuna una mappa di stanze
che sale verso un boss (Nurikabe, Yamata-no-Orochi, Nurarihyon).

- **Veglie** (scontri), **lanterne rosse** (élite), **falò** (curarsi o potenziare una carta), **mercato dei tanuki**
  (carte, amuleti, dimenticare una carta, tè caldo), **santuari** (lasciar andare una carta o trasformarla),
  **nascondigli** (un amuleto a scelta tra tre).
- Dopo ogni veglia: **una carta su tre**, o salta per qualche mon. Élite e boss lasciano **amuleti**.
- Quattro custodi: **Hanae** (sacerdotessa: talismani, sigilli, purificazione), **Ichi** (ronin: blocchi, spine, colpi pesanti),
  **Bunbuku** (tanuki: esche, economia, trucchi), **Seimei** (onmyōji: servitori di carta che vanno dove c'è il guaio, la prima
  carta di ogni scontro è gratis). Si sbloccano battendo i boss delle prime due notti e vincendo una salita.
- **Fasi lunari**: dopo una vittoria si sblocca una difficoltà crescente (cinque regole, una per fase: più vita ai nemici, meno
  fiamma, élite più dure, mercato più caro, parata più veloce).
- Salvataggio a ogni stanza. Almanacco con tutto ciò che hai incontrato; storico delle ultime salite.

## 2. Direzione artistica e audio

- **Washi di notte.** Indaco profondo, una luce di lanterna che brilla davvero (l'opposto del vecchio stile piatto), carte come
  talismani di carta con un sigillo rosso per il costo, contorni spessi e colori pieni su ogni creatura. Tutto è disegno
  vettoriale generato nel codice (`src/ui/art/`), niente immagini esterne.
- **Menu come porte shoji** che si chiudono e si riaprono tra una schermata e l'altra; il cielo si schiarisce verso l'alba
  durante lo scontro; sul titolo una piccola parata cammina sul crinale.
- **Font:** Potta One (titoli), Dela Gothic One (numeri), Zen Maru Gothic (testi), tutti OFL, inclusi in `src/assets/fonts`.
- **Musica generativa** (koto, flauto, taiko, blocchi di legno) su scale giapponesi, una traccia per notte più boss, falò,
  mercato, vittoria; effetti sintetizzati con WebAudio. Nessun file audio.

## 3. Lingue

Inglese (sorgente) e italiano. Le carte mostrano numeri e regole letti dai dati: non esiste testo di regole scritto a mano.

## 4. Per chi sviluppa

```bash
npm run dev      # server di sviluppo (anche dal telefono)
npm run check    # tsc + biome + vitest
npm run sim      # bot: percentuali di vittoria
npm run e2e      # smoke test Playwright su viewport mobile
```

Strumenti di prova: tocca 7 volte la versione sul titolo per attivare il menu di debug (sblocca i custodi, salta alle notti).
`dev/art.html` (solo in dev) mostra tutti i disegni.
