# `src/ai/` — experimental AI-augmented tooling

**Status: experimental. OFF by default. Not part of the core framework.**

Nothing here is imported by fixtures, page objects, or services. The whole
directory is inert unless **both**:

```bash
AI_FEATURES_ENABLED=true
ANTHROPIC_API_KEY=sk-ant-...
```

Calling in without both throws a clear error rather than silently doing nothing.
`AI_MODEL` (default `claude-sonnet-5`) selects the model.

## What's here

| Module                   | What it does                                                                              | Safety boundary                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `anthropic-client.ts`    | Thin env-gated wrapper over `@anthropic-ai/sdk`                                           | Throws unless enabled; never imported by core                                               |
| `test-data-generator.ts` | `generateData(zodSchema, { description, count })` → records **parsed through the schema** | Schema is the guardrail; disabled → throws, pointing at `data/factories/`                   |
| `locator-healer.ts`      | On a broken locator, ask for alternative selectors from a DOM snapshot                    | **Suggest-only.** Logs + attaches to the report. Never rewrites a locator, never runs in CI |
| `scaffold-test.ts`       | `npm run ai:scaffold -- --story <path>` → a `.draft.spec.ts` starting point               | Human finishes it; not committed automatically; TODO banner in the file                     |

## Why it's isolated

An AI call is non-deterministic and adds latency and a network dependency. If it
sat in the hot path it would make the suite flaky — the opposite of the point.
Keeping it in a separate, env-gated directory means:

- the default suite has zero AI dependency (no import cost, no network, no key);
- CI runs are byte-identical whether or not a key exists;
- the experimental surface can evolve without destabilising the framework.

## Risks (read before enabling)

- **Cost** — every call spends tokens. `generateData` and `scaffold` are one-shot;
  `locator-healer` sends a truncated DOM (~8 KB).
- **Hallucination** — mitigated by parsing generator output through the zod schema
  and by making the healer suggest-only.
- **Never auto-apply a healed locator.** A selector that silently changes what a
  test asserts hides regressions. A red test is the correct outcome.
