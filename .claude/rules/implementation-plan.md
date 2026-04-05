# Implementation Plan — {PROJECT_NAME}

> Phased project plan. Read before starting new features.
> PM maintains this as phases progress. Never start phase N+1 before N is complete.

globs: .claude/epics/**, .claude/prds/**

## Phases

### Phase 1: Foundation

**Status:** not started
**Epics:** _to be defined by PM_

### Phase 2: Core Features

**Status:** not started
**Depends on:** Phase 1 complete
**Epics:** _to be defined by PM_

### Phase 3: Polish & Launch

**Status:** not started
**Depends on:** Phase 2 complete
**Epics:** _to be defined by PM_

## Sequencing Rules

- Data model features before UI that uses them
- Auth setup before any protected routes
- Read features before write features
- Core flows before edge cases
- Each feature is a branch (PR), integration via merge to main
- Never merge without full test suite passing
