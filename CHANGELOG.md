# Changelog

All notable changes to this project will be documented in this file.

## [2026-04-06] — #1 Terms of Service page

- Added: `/terms` route as a Server Component with placeholder content noting UK jurisdiction.
- Added: "Terms" link in the footer Company section, immediately after "Privacy".
- Added: Test verifying the page renders the expected heading.
- Changed: `jest.config.ts` now transforms TSX with `react-jsx` so component tests can render JSX.
- Files: `src/app/terms/page.tsx`, `src/app/terms/page.test.tsx`, `src/app/layout.tsx`, `jest.config.ts`
