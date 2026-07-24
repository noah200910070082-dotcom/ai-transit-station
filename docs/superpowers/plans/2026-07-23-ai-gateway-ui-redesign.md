# AI Gateway UI Redesign Implementation Plan

1. Extend `src/api/newApi.ts` with typed usage-log, model, wallet and redemption calls already supported by new-api.
2. Replace the monolithic template in `src/App.tsx` with a real authenticated app shell and distinct page renderers.
3. Keep authentication standalone, public registration enabled when the backend allows it, optional invitation code, hidden admin behavior, and three-language support.
4. Replace `src/styles.css` with a compact responsive console visual system following `PRODUCT.md`.
5. Verify TypeScript build, Impeccable checks, dependency audit and browser behavior at desktop and mobile widths.
