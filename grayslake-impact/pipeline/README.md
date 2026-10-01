# Research pipeline

Finds new information about T5 @ Chicago IV, checks it, and drafts entries for
`src/data/` as pull requests. Nothing publishes without the owner merging a PR.
Plan: [`docs/automation-pipeline-plan.md`](../docs/automation-pipeline-plan.md).

Status: **Stage B** (Tier 1 fetchers in shadow mode). Stage A built the rubric
loader, verbatim guard and model benchmark. Drafting (C) and scheduling (D)
come next. Shadow mode writes only to the private store and opens no PRs.

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
| `pipeline/lib/fetchers/` | Tier 1 fetchers: Village agendas page, Village News Flash RSS, Village YouTube, ilga.gov bill status, Lake County Legistar |
| `pipeline/lib/runner.mjs` | Shadow-mode run: state, first-run baseline, dedupe, tier lookup, Wayback queue, health |
| `pipeline/lib/dedupe.mjs`, `wayback.mjs` | URL/content/near-duplicate checks; Save Page Now capture and verification |
| `pipeline/scripts/` | `build-corpus`, `guard-timeline`, `bench-models`, `run-fetch` |
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
npm run pipeline:fetch             # Stage B: run the Tier 1 fetchers once, shadow mode
npm run pipeline:fetch -- --only ilga-bills --no-snapshots
```

The scripts run Node with `--use-system-ca`: ilga.gov serves an incomplete
certificate chain that Node's bundled CA list cannot complete, while the
Windows store can. Certificate checking stays on.

Shadow output in the private store: `shadow/items/<date>/<fetcher>/` (one
JSON per item, with text, hashes, tier, dedupe and snapshot result),
`shadow/raw/` (fetched bytes by SHA-256), `state/` (seen keys, cursors,
dedupe index, Wayback queue), `logs/runs/` (one log per run).

## Secrets

None are required to run Stages A and B; the two Stage B ones improve
reliability. None are ever stored in this repository. They are read from
environment variables (set them as Windows user environment variables):

| Variable | Needed for | Stage |
|---|---|---|
| `GEMINI_API_KEY` | Gemini fallback, only if enabled | C |
| `ANTHROPIC_API_KEY` | Claude fallback, only if enabled | C |
| `NTFY_TOKEN`, `NTFY_TOPIC` | Tier 1 phone alerts | D |
| `IA_S3_ACCESS`, `IA_S3_SECRET` | Wayback Save Page Now with an account (anonymous works but is rate-limited) | B |
| `YOUTUBE_API_KEY` | Fallback when YouTube's RSS feed returns 404 (intermittent) | B |

`gh` uses its own keyring login (`gh auth status`).
