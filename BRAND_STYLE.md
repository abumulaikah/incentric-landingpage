# Incentric Brand Style

Global brand styles live in `src/index.css` and are loaded by `src/layouts/BaseLayout.astro`.

## Page Structure

Use these classes for new pages:

```astro
<BaseLayout title="Page | Incentric CX" description="Page description.">
  <main class="brand-page brand-main">
    <div class="brand-container--narrow">
      <a href="/" class="brand-link">Back to home</a>

      <section class="brand-section-header mt-8">
        <p class="brand-kicker">Section Label</p>
        <h1 class="brand-display">Page headline.</h1>
        <p class="brand-copy mt-6">Supporting copy.</p>
      </section>
    </div>
  </main>
</BaseLayout>
```

For dark pages, add `brand-page--dark`:

```astro
<main class="brand-page brand-page--dark brand-main">
```

## Reusable Classes

- `brand-app`: root shell for React app pages.
- `brand-page`: default page background, font, and text color.
- `brand-page--warm`: warmer editorial surface.
- `brand-page--dark`: dark page surface with white text.
- `brand-main`: standard page padding.
- `brand-container`: max-width `7xl`.
- `brand-container--narrow`: max-width `5xl`.
- `brand-section`: vertical section spacing.
- `brand-section-header`: page header divider.
- `brand-kicker`: uppercase section label.
- `brand-display`: large page title.
- `brand-heading`: section title.
- `brand-subheading`: card title.
- `brand-copy`: paragraph copy.
- `brand-actions`: button group layout.
- `brand-card`: reusable card.
- `brand-chip`: small filter/category chip.
- `brand-field`: input/select style.
- `brand-link`: text link.

## Buttons

Start with `brand-button`, then add one variant:

```html
<a href="/#contact" class="brand-button brand-button--primary">Talk to Incentric</a>
<a href="/#contact" class="brand-button brand-button--yellow">Start Now</a>
<a href="/blog" class="brand-button brand-button--outline">Read Articles</a>
```

Available variants:

- `brand-button--primary`
- `brand-button--yellow`
- `brand-button--dark`
- `brand-button--light`
- `brand-button--outline`

