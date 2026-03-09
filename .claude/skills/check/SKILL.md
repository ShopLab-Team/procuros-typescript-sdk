---
name: check
description: Run full quality pipeline (type-check, build, test)
disable-model-invocation: true
---

# Check Skill

Run the complete quality pipeline to verify the project is in a healthy state. This mirrors what CI runs.

## Steps

Run all three checks sequentially. If any step fails, report the failure clearly and stop.

```bash
pnpm run type-check
pnpm run build
pnpm run test
```

### Output

Report a summary:

| Check | Result |
|-------|--------|
| Type-check | pass/fail |
| Build | pass/fail |
| Test | pass/fail (N tests) |

If all pass, confirm the project is ready to commit/push/release.

If any fail, show the relevant error output and suggest fixes.
