---
globs:
  - 'src/**'
  - 'supabase/**'
---

# TDD

All implementation follows RED-GREEN-REFACTOR:

- Write a failing test before writing implementation code
- Write the minimum code to make the test pass
- Refactor only when all tests are green
- Never refactor while RED
- Vertical slices: test1→code1, test2→code2. Never all tests first.

Tests verify behaviour through public interfaces. If renaming an internal function breaks a test, the test is wrong.
