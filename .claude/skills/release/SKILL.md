---
name: release
description: Bump version, update CHANGELOG, commit, push, and create a GitHub release
disable-model-invocation: true
---

# Release Skill

Create a new release for `@shoplab/procuros-sdk`. This skill handles the full release pipeline.

## Arguments

- `$ARGUMENTS` — The semver bump type: `patch`, `minor`, or `major`. If omitted, analyze commits since the last tag and determine automatically using conventional commits (feat → minor, fix → patch, BREAKING CHANGE → major).

## Steps

### 1. Determine the version bump

If `$ARGUMENTS` is provided, use it as the bump type. Otherwise:

```bash
# Get the latest tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")

# Check commit messages since last tag
git log "$LAST_TAG"..HEAD --oneline
```

Apply conventional commit rules:
- Commits with `BREAKING CHANGE` or `!:` → `major`
- Commits starting with `feat` → `minor`
- Everything else → `patch`

### 2. Run quality checks

Run the full quality pipeline before releasing:

```bash
pnpm run type-check
pnpm run build
pnpm run test
```

If any step fails, stop and report the error. Do NOT proceed with a broken release.

### 3. Bump the version

Read the current version from `package.json`, compute the new version, and update `package.json`.

### 4. Update CHANGELOG.md

Prepend a new section to `CHANGELOG.md` following the Keep a Changelog format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- (new features from `feat:` commits)

### Changed
- (changes from other commits)

### Fixed
- (bug fixes from `fix:` commits)
```

Also update the comparison link at the bottom of the file:
```markdown
[X.Y.Z]: https://github.com/ShopLab-Team/procuros-typescript-sdk/compare/vPREV...vX.Y.Z
```

Omit empty sections (e.g., don't include `### Fixed` if there are no fixes).

### 5. Commit, tag, and push

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
git push origin master
```

### 6. Create the GitHub release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "$(CHANGELOG_SECTION)"
```

Use the CHANGELOG section content (without the heading) as the release notes body. Append:

```
**Full Changelog**: https://github.com/ShopLab-Team/procuros-typescript-sdk/compare/vPREV...vX.Y.Z
```

### 7. Report the result

Output the release URL and confirm the version was published.
