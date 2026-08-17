# 52 Week Challenge — GitHub Pages + PWA

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository GitHub, ad esempio `52-week-challenge`.
2. Carica tutti i file e la cartella `icons`.
3. Vai in **Settings → Pages**.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona il branch `main` e la cartella `/ (root)`.
6. Salva e attendi la pubblicazione.
7. Apri l'indirizzo GitHub Pages dal telefono.
8. Dal browser scegli **Aggiungi alla schermata Home / Installa app**.

## Dati

I progressi vengono salvati esclusivamente nel `localStorage` del browser.
Non viene usato alcun account, database o server.

Usa **Esporta** per creare un backup JSON. Conservalo in un posto sicuro.
**Importa** permette di ripristinare il backup.

## Nota PWA

Il service worker richiede HTTPS, quindi funziona normalmente su GitHub Pages.
