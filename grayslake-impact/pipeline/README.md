# Research pipeline

Finds new information about T5 @ Chicago IV, checks it, and drafts entries for
`src/data/` as pull requests. Nothing publishes without the owner merging a PR.
Plan: [`docs/automation-pipeline-plan.md`](../docs/automation-pipeline-plan.md).

Status: **Stage A** (rubric loader, verbatim guard, model benchmark). Fetchers,
drafting and scheduling come in Stages B–D.

## Layout

| Path | What |
|---|---|
| `config/credibility-rubric.yaml` | Tiers, claim types, guard parameters |
| `config/sources.yaml` | Domain → tier registry; anything unlisted is Tier 4 |
| `config/pipeline.yaml` | Model provider, `num_ctx`, rate limits, spend cap, paths, editorial holds |
| `pipeline/lib/guard.mjs` | The verbatim guard |
| `pipeline/lib/rubric.mjs`, `registry.mjs`, `config.mjs` | Loaders and validators |
| `pipeline/lib/providers/` | Provider interface; Ollama is the default |
| `pipeline/lib/extract.mjs` | Chunking, extraction prompt, schema validation with one retry |
| `pipeline/schemas/extraction.schema.json` | What the model must return |
| `pipeline/scripts/` | `build-corpus`, `guard-timeline`, `bench-models` |
| `pipeline/test/` | `node:test` suites, no network |

## Private store

Raw source text, leads, logs, reports and shadow drafts live in a local clone
of the private repo `quentinconklejr/private-info`, **outside this repository**
(default `C:/Users/Quentin/private-info`, override with `PRIVATE_INFO_DIR`).
The config loader refuses a path inside this repository.

```
gh repo clone quentinconklejr/private-info C:/Users/Quentin/private-info
```

## Commands

```
npm run pipeline:test              # unit tests, offline
npm run pipeline:corpus            # fetch the text of every source the timeline cites (network)
npm run pipeline:guard-timeline    # run the guard over the existing timeline entries (offline)
npm run pipeline:bench             # benchmark candidate Ollama models (local GPU)
npm run pipeline:bench -- --ctx-probe
```

## Secrets

None are needed for Stage A. None are ever stored in this repository. Later
stages read them from environment variables:

| Variable | Needed for | Stage |
|---|---|---|
| `GEMINI_API_KEY` | Gemini fallback, only if enabled | C |
| `ANTHROPIC_API_KEY` | Claude fallback, only if enabled | C |
| `NTFY_TOKEN`, `NTFY_TOPIC` | Tier 1 phone alerts | D |
| `IA_S3_ACCESS`, `IA_S3_SECRET` | Wayback Save Page Now captures | B |

`gh` uses its own keyring login (`gh auth status`).
