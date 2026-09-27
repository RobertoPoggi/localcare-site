# LocalCare S.r.l. — sito statico

Clone fedele di **www.localcare.it** (WordPress + tema Flexform) convertito in sito
statico e ospitato su **Cloudflare Pages**. Nessun CMS, nessun database, nessun
build step: i file sono serviti direttamente.

## Struttura

    public/                      radice pubblicata da Cloudflare Pages
      index.html                 Home (pagina originale, snapshot 29/04/2024)
      <slug>/index.html          36 pagine interne (stesso scheletro del tema)
      news/                      (elenco news, agli URL originali dei post)
      wp-content/themes/flexform CSS e JS del tema originale
      wp-content/plugins/        CSS/JS dei plugin (revslider, cforms2, cookie-law, cf7)
      wp-content/uploads/        immagini, brochure e PDF
      wp-includes/               jQuery e librerie WordPress
      robots.txt / sitemap.xml   SEO — 37 URL
      404.html                   pagina di errore
      _headers / _redirects      configurazione Cloudflare Pages
    functions/api/contatti.js    Cloudflare Pages Function per i form
    wrangler.toml                configurazione Pages
    package.json                 script di sviluppo e deploy

## Deploy su Cloudflare Pages

1. Creare il repository su GitHub e caricare il contenuto di questa cartella.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → selezionare il repository.
3. Impostazioni di build:
   - Framework preset: **None**
   - Build command: *(vuoto)*
   - Build output directory: **public**
4. **Save and Deploy**. Il sito risponde su `localcare-site.pages.dev`.

Da qui in poi ogni push su `main` aggiorna il sito automaticamente.

### Collegare www.localcare.it

Cloudflare Pages → progetto → **Custom domains** → *Set up a domain* →
`www.localcare.it` → creare il record CNAME richiesto nel pannello
**register.it**. I nameserver restano `ns1.register.it` / `ns2.register.it`:
**la posta `@localcare.it` non viene toccata**.

Per l'indirizzo senza `www`: attivare su register.it il redirect
`localcare.it` → `www.localcare.it` (servizio di URL forwarding del pannello).

## Attivazione dei form

I form delle pagine *Contatti*, *Richiedi informazioni* e *Richiedi una prova*
inviano a `POST /api/contatti`, gestito dalla Function `functions/api/contatti.js`
(provider: Resend, piano gratuito).

1. Creare un account su <https://resend.com> e verificare il dominio `localcare.it`.
2. Cloudflare Pages → **Settings** → **Variables and Secrets**:

   | Variabile | Valore |
   |---|---|
   | `RESEND_API_KEY` | chiave API Resend *(secret)* |
   | `MAIL_TO` | `info@localcare.it` *(opzionale)* |
   | `MAIL_FROM` | `sito@localcare.it` *(mittente verificato)* |

Finché la Function non è configurata il modulo mostra un link `mailto:`
precompilato: **nessuna richiesta viene persa**.

## Deploy da riga di comando (alternativa)

    npm install
    npm run deploy

## Manutenzione

- I testi si modificano direttamente nei file `public/**/index.html`.
- Le immagini vanno in `public/wp-content/uploads/` mantenendo il percorso originale.
- Per verificare in locale: `npm run dev` (oppure `python3 -m http.server -d public`).

## Note

- La home è la pagina WordPress originale archiviata il 29/04/2024.
- Le pagine interne riproducono il medesimo scheletro del tema Flexform con i
  contenuti dell'export WordPress; URL, titoli e contenuti sono quelli originali.
- I form originali (plugin cformsII, PHP) sono stati sostituiti dalla Function.
- I link interni assoluti (`http://www.localcare.it/...`) sono quelli originali e
  funzionano regolarmente una volta collegato il dominio.
