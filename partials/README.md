# partials/ — a reference cut, nothing more

These files are **not loaded at runtime**. There is no build step and no include:
the 24 pages work exactly as they did, with every block still written inside its
own page.

The folder exists for one reason. When the theme is ported to Laravel, you open
a file here and find the shared piece cut verbatim from its source, with a
comment saying how many pages use it and what differs between the copies. You do
not have to diff 24 files yourself.

> **Treat this folder as build output.** If you edit a page's markup, the file
> here goes stale. Re-cut it from the source named in its header instead of
> editing it here.

---

## The map

| File | Source | Lines | Pages using it | Identical? |
|---|---|---|---|---|
| `header.html` | `article.html` | 19–135 | 23 / 24 | ✅ one shape, once the active state is normalised |
| `navbar.html` | `article.html` | 56–114 | 23 / 24 | ✅ (part of the header) |
| `breaking-news.html` | `article.html` | 117–134 | 23 / 24 | ✅ byte-for-byte identical |
| `footer.html` | `article.html` | 325–396 | 23 / 24 | ⚠️ two versions (A with social icons, B without) |
| `breadcrumb.html` | `category.html` | 140–144 | 16 | ❌ six shapes — this is the commonest |
| `card-article-wide.html` | `category.html` | 212–220 | — | ❌ a representative sample only |
| `card-article-compact.html` | `category.html` | 227–234 | — | ❌ a representative sample only |
| `pagination.html` | `search.html` | 249–258 | 4 | ❌ different margins on every page |
| `form-contact.html` | `contact.html` | 158–242 | 1 | — the only complete form |
| `form-newsletter.html` | `newsletter.html` | 197–219 | 1 | — not the small form inside the footer |

**✅** = ready to become a Blade component as it stands.
**⚠️** = ready, with one or two variables.
**❌** = a sample to work from. Forcing these into one shape would change how the
pages look, and that is not allowed.

---

## A suggested order for the port

Start with the first three. Those alone carry about a third of the repeated
markup in the project:

1. **`header.html`** — the highest return and the lowest risk. One variable
   (`$active`), and the hover classes inside it (`.sh-x1`…`.sh-x38`) are already
   identical across the 23 pages, so no CSS has to change.
2. **`footer.html`** — two variables (`$social`, `$logoLink`). Mind the note
   about the numbered classes in the file's header.
3. **`breaking-news.html`** — completely identical, and all of its content sits
   in a single `data-items` attribute.

Then `navbar.html`, if you want it separated from the header.

Leave the rest — breadcrumb, cards, pagination, forms — inline in the views
until the front-end team decides to unify their shapes deliberately.

---

## What must not be ported as it is

- **`homepage-v2/v3/v4.html` and `loader.html`** were deleted (8 September
  2026). They were standalone concept pages: no header, no footer, no `data-sh`
  hooks.
- **The `.sh-xN` classes** are generated and numbered by the order the element
  appears inside its own page, and each is bound 1:1 to a rule in
  `css/<page>.css`. Do not renumber them and do not share them between pages in
  the current static build. When porting, replace them with stable semantic
  names — and do that for the markup and the CSS together, in one step.
- **`href="#"` links**, of which there are many in the footer and some menus.
  They are placeholder content, left as they are on purpose. On the port they
  become `route()`.

> **September 2026 update:** `header.html` and `footer.html` have become the
> actual source of truth. `python tools/chrome.py` copies them into every page
> between the `sh:header` and `sh:footer` markers. The rest of the folder is
> still reference material.
