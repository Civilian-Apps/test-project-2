# Changelog Rule

> Instructs agents to maintain CHANGELOG.md.

globs: src/**, supabase/**

After completing any feature implementation, append to CHANGELOG.md:

- Date
- Issue number (if applicable)
- What was added/changed
- Key files affected

Read CHANGELOG.md before starting work to understand recent changes and avoid conflicts.

Format:

```markdown
## [YYYY-MM-DD] — #{issue_number} {feature name}

- Added: {description}
- Changed: {description}
- Files: {list of key files}
```
