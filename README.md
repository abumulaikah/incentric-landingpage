# Incentric CX Landing Page

Astro-based landing page with a Markdown blog.

## Development

Prerequisites:

- Node.js
- npm

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

Check Astro and TypeScript diagnostics:

```bash
npm run lint
```

## Blog

Blog posts live in `src/content/blog` as Markdown files.

Example:

```md
---
title: 'Article title'
description: 'Short article summary.'
pubDate: 2026-05-12
author: 'Incentric'
draft: false
---

Article content goes here.
```
