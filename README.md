# Хуулийн туслах (mn-law-chat)

**Live:** https://mn-law-chat.vercel.app

A chat interface for asking questions about Mongolian law. Answers come from the
[`ebuuu1412/mongolian-law-assistant`](https://huggingface.co/spaces/ebuuu1412/mongolian-law-assistant)
Hugging Face Space, which searches current legislation and cites the articles it uses.

> Answers are not legal advice. Check important matters at [legalinfo.mn](https://legalinfo.mn)
> or with a lawyer.

## Features

- Streaming answers rendered as Markdown, with cited law articles
- Two answer modes: **Хурдан** (fast) and **Нарийвчилсан** (more careful)
- Saved chat history with search, stored in the browser only
- Light and dark themes
- Keyboard shortcuts (see below)
- Works on desktop and mobile

## Tech stack

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [`@gradio/client`](https://www.gradio.app/docs/js-client) to talk to the Hugging Face Space
- [`react-markdown`](https://github.com/remarkjs/react-markdown) for rendering answers
- Hosted on [Vercel](https://vercel.com)

No backend and no API keys: the browser calls the public Space directly.

## Run it locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

## Project structure

```
index.html        page shell; applies the saved theme before first paint
public/           static files (favicon)
src/main.jsx      React entry point
src/App.jsx       the whole app: Space connection, chat state, UI
src/App.css       component styles
src/index.css     colour tokens and light/dark themes
design.md         design reference the UI follows
```

## How it works

- `src/App.jsx` connects to the Space with `@gradio/client`, streams the answer from the `/chat`
  endpoint, and renders it as Markdown.
- The Space has no memory, so a short follow-up question is sent along with the previous question.
- Chats and the theme choice are saved in the browser's `localStorage` only.

## Deployment

The site is deployed on Vercel, connected to this GitHub repository:

- Every push to `main` deploys to production at https://mn-law-chat.vercel.app.
- Pushes to other branches and pull requests get their own preview URL.

Vercel detects Vite automatically (build command `npm run build`, output directory `dist`), so no
extra configuration is needed. To deploy by hand from your machine instead:

```sh
npx vercel@latest --prod
```

## Design

The UI follows the reference in [`design.md`](design.md): a neutral greyscale palette, a centred
48rem conversation column, a pill composer, and light/dark themes. The colour tokens are in
`src/index.css`.

### Keyboard shortcuts

| Keys | Action |
|---|---|
| Enter / Shift+Enter | Send / new line |
| ⌘/Ctrl+Shift+O | New chat |
| ⌘/Ctrl+Shift+S | Show or hide the sidebar |
| ⌘/Ctrl+K | Search chats |
| ⌘/Ctrl+Shift+C | Copy the last answer |
| Shift+Esc | Focus the question box |
| Esc | Stop the answer |
