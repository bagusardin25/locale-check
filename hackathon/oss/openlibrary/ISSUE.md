# Draft issue for internetarchive/openlibrary

Status: **draft, not posted.** Posting needs the user's word.

---

**Title:** Arabic (and other RTL) UI is served without `dir="rtl"`, so the whole layout stays left-to-right

### Describe the problem

With the interface set to Arabic (`https://openlibrary.org/?lang=ar`), the page text is Arabic but the layout is left-to-right:

- headings and the welcome card are aligned to the left;
- carousels, the "Browse shelves" row and book rows start from the left, and the "عرض الكل ›" (view all) arrows point right;
- the prev/next carousel arrows keep their left-to-right meaning.

`document.documentElement` has `lang="ar"` but no `dir` attribute, so the computed `direction` is `ltr`.

The design guide says this should not happen: `docs/frontend/design.md` ("Right-to-left") says Open Library serves Arabic, Hebrew and Persian readers and that layout must mirror under `dir="rtl"`, and `.github/instructions/ui.instructions.md` asks for logical properties for the same reason. The logical properties can't take effect while the document is never in RTL.

Separately, several shelf names on the Arabic home page are still English (Thriller, Romance, Mystery, Fantasy, Sci-Fi, Crime) next to translated ones.

### Expected behaviour

For `ar`, `fa` and `he` (and `ur`, if added), the `<html>` element carries `dir="rtl"`, so the existing logical properties and `:dir(rtl)` rules mirror the layout.

### Steps to reproduce

1. Open `https://openlibrary.org/?lang=ar` in a desktop browser (seen at 1920×1080, Chrome).
2. Look at the header, the welcome card and the "Browse shelves" row; run `getComputedStyle(document.body).direction` in the console.
3. Actual: `ltr`, left-aligned Arabic text. Expected: `rtl`.

### Evidence

Found by an automated multilingual check (Kane CLI, an AI browser tester, running the same plain-English objective in en, de, ar, ja and zh). Kane's verdict for Arabic: *"Arabic homepage retains left-to-right layout. The Arabic version of the page was loaded, but its page layout was not switched to right-to-left."* Screenshot attached (`kane-ar-homepage.jpg`). Confirmed by hand on 2026-11-18.

### Likely cause and a possible fix

`openlibrary/templates/shell/base.html.jinja:6` renders `<html lang="{{ layout.lang }}">` with no `dir`. A small fix is a `dir` property on `LayoutContext` (`openlibrary/core/shell/context.py`), next to `active_ui_lang`, and `dir="{{ layout.dir }}"` on `<html>`; see the attached patch. Turning RTL on may surface places that still use physical properties (`left`, `margin-left`); the design playground's RTL check (`/developers/design/playground#rtl`) is the tool for those.

Happy to open a PR with the patch and a test in `openlibrary/tests/core/test_layout.py` if that helps.
