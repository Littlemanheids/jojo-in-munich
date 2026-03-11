# How This Works — Reference Guide

## The Agents

**`/architect`**
Thinks before anything gets built. Feed it a brief, it produces a PRD (what to build) and ADR (why this stack). Always run this first. If the brief is vague, the output will be vague — so get the brief right before running it.

**`/pm:prd-parse`**
Reads the PRD and breaks it into epics and GitHub Issues. Your task list gets created automatically. Review and reorder after it runs.

**`/builder`**
Executes a single task. Point it at a GitHub Issue, it writes the code. Works best on well-defined tasks. Will guess wrong on ambiguous ones — your job is to catch that.

**`/swarm-plan` + `/swarm-execute`**
Runs multiple builders in parallel. Use only when tasks are truly independent of each other. Not for early-stage work where things are still shifting.

---

## Division of Labor

| You | The Agents |
|---|---|
| Write and refine the brief | Turn brief into PRD (`/architect`) |
| Make all product decisions | Break PRD into tasks (`/pm:prd-parse`) |
| Review everything produced | Write the code (`/builder`) |
| Test what gets built | Handle all boilerplate |
| Push back when it's wrong | First drafts of everything |
| Approve and merge | Parallel execution (`/swarm`) |

Product decisions don't get delegated. Ever.

---

## The Right Sequence

```
1. GET THE BRIEF RIGHT (outside Claude Code — in chat)
   → Nail down what you're building before touching any agent
   → Decisions made here save hours of rework later

2. /architect (Claude Code)
   → Paste the complete brief
   → Have the PRD conversation — push back, refine
   → Approve the final PRD + ADR

3. /pm:prd-parse (Claude Code)
   → Review the GitHub Issues it creates
   → Cut anything that isn't V1
   → Sequence tasks by dependency order

4. /builder — one task at a time (Claude Code)
   → Start with infra: DB tables, environment, deploy
   → Then work feature by feature
   → Test each task before moving to the next

5. /swarm (Claude Code — later phases only)
   → Only after architecture is locked
   → Only for tasks with no dependencies on each other
```

---

## Ground Rules

- Never run `/builder` on a task that depends on something not yet built
- Never run `/swarm` on tasks that share dependencies
- If `/builder` produces something wrong, don't keep iterating blindly — go back to the brief or the PRD and fix the spec first
- GitHub Issues are the source of truth for what's in progress. Keep them updated.
