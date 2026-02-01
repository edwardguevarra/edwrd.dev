---
title: "How I Actually Use Cursor IDE: A Practical Workflow"
description: "A year of daily use: my workflow for simple vs complex tasks, Ask → Plan → Implement, when to trust AI (and when not to), and documenting work in Linear vs GitHub."
date: 2025-02-01
author: "Edward"
tags: ["cursor", "ai-coding", "workflow", "productivity"]
featuredImage: "/images/cursor-workflow.jpg"
featuredImageAlt: "Developer working on multiple screens in a dark office - productivity workflow with coding monitors"
---

I've been using Cursor IDE for almost a year now—since April 2025—and the single most important lesson I've learned is this: _how_ you use it matters more than _that_ you use it.

This post is for experienced developers who've been burned by AI coding tools. The ones who tried it, got a mess of changes they didn't understand, and swore it off. If that's you, I want to share the workflow that keeps me in control while still moving fast.

## Picking the Right Mode

**Simple tasks** — copy editing, small styling changes, straightforward refactors — I use **Agent mode** with a clear, scoped prompt. Something like: "Change the button color in Header.astro to lime green." No ambiguity, no room for the AI to "help" by changing unrelated things.

**Complex tasks** — when I don't immediately know where the code lives, what might break, or how to approach the problem — I _never_ start with Agent. I start with understanding.

## My Flow for Complex Tasks

1. **Ask mode** — brainstorm, research, understand impact
2. **Plan mode** — generate a step-by-step plan
3. **Review the plan** — correct it before implementation
4. **Implement** — let Cursor execute the full plan (it does the whole thing at once)
5. **Test** — run through the changes, verify everything works
6. **Loop** — if something fails, back to Ask mode and repeat

One caveat: when you execute a plan, Cursor implements it all in one go. You don't get step-by-step execution. So the "small steps" happen at the _task_ level—I break the work into little pieces _before_ I ask for a plan. Each small task gets its own Ask → Plan → Execute → Test cycle. I don't give Cursor big tasks; the AI executes, I decide.

## A Real Example: Debugging a Production Bug

Here's how this played out on a production bug I worked on (details anonymized).

### Phase 1: Replicate and Understand

First, I replicated the bug using the steps our customer support team had documented. Once I could reproduce it reliably, I switched to **Ask mode**.

I asked: "What could possibly cause this?" Cursor suggested hypotheses. I checked each one, verified by testing—I don't blindly trust AI, especially with weaker models. I prefer Opus for bigger tasks, but it's costlier, so I reserve it for when it matters.

I kept asking: "If we change X, does that fix it? What are other options?" Then I'd summarize and validate: "What am I missing?" I didn't move on until I understood the problem and the AI's reasoning matched mine.

### Phase 2: Plan

Once I was satisfied, I switched to **Plan mode** and let Cursor generate an implementation plan. I read it. I corrected it. I had the AI fix parts I disagreed with. I repeated until the plan was solid. _Then_ I let it implement.

### Phase 3: Implement and Test

When I hit execute, Cursor implemented the full plan in one go. I got manual testing instructions and ran through them. When something failed, I didn't just ask it to "fix it." I went back to **Ask mode**: "Why is this happening?" I manually verified, understood the cause, and only then asked for a new plan. I don't let the AI do things I don't understand—at least at a high level.

That loop—Ask → Plan → Execute (full plan) → Test → repeat—continued until everything worked.

### Phase 4: Final Review

Before considering it done, I used GitHub PR or Cursor's source control to review every change the AI made. I needed to understand all of it. No blind commits.

### Phase 5: Document

Then I used **Linear** and **GitHub MCP** to update the issue and PR. I included the relevant conversation context—especially for larger features that span multiple subtasks. I had Cursor summarize for Linear (high-level, no code) and write the technical details for GitHub (code, architecture, testing instructions). I double-checked what the AI wrote until I was satisfied, then marked everything ready for team testing.

## When to Trust AI (and When Not To)

- **Weaker models:** Verify more. I don't trust blindly.
- **Harder tasks:** I use Opus. It costs more, but it's worth it for complex debugging and architecture.
- **Always test:** I run the code, click through the UI, verify behavior myself.
- **If I don't understand:** I stop. I use Ask mode to get clarity. I don't proceed until I get it—at least at a high level.

## Keeping Prompts Clear

I keep prompts specific: which files, which components, what scope. I define boundaries: "only the mobile menu," "don't touch the API." Sometimes I add acceptance criteria: "Done when the toggle works and respects the user's dark mode preference."

**What I avoid:**

- Pasting huge files and saying "fix it"
- Asking for "everything" in one prompt
- Skipping the plan review before letting it implement
- Vague, context-free requests

## Documenting Work: Linear vs GitHub

After I finish a task (or a small batch), I take the Cursor conversation and turn it into two write-ups.

**For Linear** — project and product context. I ask Cursor to summarize the conversation. Requirements: high-level, non-technical, no code, minimal implementation detail. Focus on what was done, why, and the outcome.

**For GitHub** — technical handoff. I ask Cursor to write the technical content: what was implemented, why, key code snippets, architecture decisions. I also ask for testing instructions: how to run, what to check, edge cases. This is for engineers.

I use Linear and GitHub MCP so Cursor can read and update issues and PRs directly. (I'll cover MCP setup in another post.)

### Cursor commands I use

Cursor has a [Commands](https://cursor.com/docs/context/commands) feature: reusable workflows triggered with `/` in the chat. Create `.md` files in `.cursor/commands/` (project) or `~/.cursor/commands/` (global)—the filename becomes the command (e.g., `linear-summary.md` → `/linear-summary`).

**Setup:** Create `.cursor/commands/` in your project root, then add these three files:

**1. `linear-summary.md`** — Use `/linear-summary` after a task to summarize for Linear:

```markdown
Summarize this conversation for a Linear comment. Requirements:

- High-level, non-technical
- No code snippets
- Minimal implementation details
- Focus: what was done, why, outcome
- 2-4 sentences max
```

**2. `github-technical-writeup.md`** — Use `/github-technical-writeup` for PR descriptions:

```markdown
Generate a GitHub PR description (or issue comment) from this conversation. Include:

- What was implemented and why
- Key code snippets or architecture decisions
- Technical detail is fine — this is for engineers
```

**3. `testing-instructions.md`** — Use `/testing-instructions` to generate test steps:

```markdown
Generate manual testing instructions for what we built. Include: steps to run, what to click/check, edge cases, and how to verify it works. Write for another dev.
```

Copy the content inside each code block into the corresponding `.md` file. After that, typing `/` in Cursor chat will show these commands. Include the relevant conversation context (or use Linear/GitHub MCP) when you run them.

## Why This Works

- **Control:** I understand what changed and why
- **Speed:** The agent handles execution on well-defined tasks
- **Quality:** Small task granularity with testing after each execution reduces surprises
- **Clarity:** Specific prompts lead to predictable results

## TL;DR

- **Simple tasks:** Agent mode with clear, scoped prompts
- **Complex tasks:** Break work into small tasks; for each: Ask → Plan → review plan → execute (full plan) → test → loop until done
- **Trust:** Verify outputs; use stronger models (Opus) for bigger tasks
- **Documentation:** Linear = high-level summary (no code); GitHub = technical details + testing instructions
- **Golden rule:** Use the agent to execute and brainstorm, but don't let it decide with vague prompts.
