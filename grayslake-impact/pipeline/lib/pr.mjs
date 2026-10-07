/**
 * Pull requests for drafts.
 *
 * buildPr(draft)   branch name, title, body (the review surface: claims with
 *                  their verbatim quotes, links, tier, outcome, guard result,
 *                  flags, possible existing entries, a checklist)
 * makeDiff(draft)  unified diff of the four data files with the snippets
 *                  inserted, made from copies (git diff --no-index)
 * writeDryRun      writes title, body and diff to reports/dry-run/<run>/
 * openLivePr       creates the branch in a temporary git worktree off
 *                  origin/<base>, commits, pushes, and runs `gh pr create`.
 *                  Refuses unless config job.live is true AND the job was
 *                  started with --live. Never pushes to the base branch.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { applySnippets, DATA_FILES } from './render.mjs'
import { ROOT } from './config.mjs'

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

export function buildPr(d, { today }) {
  const branch = `pipeline/draft-${today}-${slug(d.sourceKey ?? d.itemId)}`
  const labels = ['pipeline', `tier-${d.effectiveTier}`]
  if (d.party) labels.push(d.party.kind === 'court_filing' ? 'allegation' : 'party-statement')
  if (d.existing?.length) labels.push('possible-duplicate')
  if (d.flags?.length) labels.push('needs-decision')
  const outcomes = [...new Set(d.claims.map(c => c.outcome))]
  const body = [
    `**Pipeline draft. Nothing publishes unless you merge this.**`, '',
    `| | |`, `|---|---|`,
    `| Source | ${d.newSource?.publisher ?? d.sourceKey} · [link](${d.url})${d.newSource?.archiveUrl ? ` · [archived](${d.newSource.archiveUrl})` : ' · not archived'} |`,
    `| Tier | ${d.tier}${d.effectiveTier !== d.tier ? ` (scored as ${d.effectiveTier})` : ''} |`,
    `| Party document | ${d.party ? `${d.party.kind === 'court_filing' ? 'court filing by' : 'statement by'} ${d.party.party}: every substantive claim is attributed` : 'no'} |`,
    `| Outcome | ${outcomes.join(', ')} |`,
    `| Guard on the drafted text | ${d.guard} (format check ${d.validation?.ok ? 'pass' : 'FAIL'}) |`,
    `| Entry date | ${d.date.date} (${d.date.basis}) |`,
    '',
    ...(d.amend ? [
      '### Changes an existing entry', '',
      `This source already has an entry. This PR **changes that entry and adds no new one**: \`${d.amend.file}\` ${d.amend.date} “${d.amend.title}” gets these sentences appended to its description:`, '',
      `> ${d.amend.added}`, '',
      `Made from ${d.claims.length} claim(s) the existing entries lack (at most 5 per PR; ${d.alreadyCovered?.coveredClaims ?? 0} already covered).`,
      ...(d.alreadyCovered?.entries.length > 1 ? ['', 'Other entries citing this source (unchanged):', ...d.alreadyCovered.entries.filter(e => e.title !== d.amend.title).map(e => `- \`${e.file}\` ${e.date} “${e.title}”`)] : []), '',
    ] : []),
    ...(d.existing?.length ? ['### Possible existing entry', '', ...d.existing.map(e => `- ${e.date} “${e.title}” (${e.why})`), ''] : []),
    ...(d.flags?.length ? ['### Flags (not edited)', '', ...d.flags.map(f => `- \`${f.file}\`${f.id ? ` \`${f.id}\`` : ''}: ${f.note}`), ''] : []),
    '### Claims and their verbatim quotes', '',
    ...d.claims.map(c => `- **${c.claim_type}${c.relabeled ? ` (model said ${c.relabeled.from})` : ''} → ${c.outcome}**: ${c.claim_text}\n  > ${c.quotes.join('\n  > ')}\n  _quote match: ${c.guardMatch.join(', ')}_`),
    '',
    ...(d.extraClaims?.length ? ['### Further claims not drafted', '', ...d.extraClaims.map(t => `- ${t}`), ''] : []),
    '### Before merging', '',
    '- [ ] Open the source and read the quotes in context',
    '- [ ] The entry says only what the quotes say; attribution is right',
    '- [ ] Date and category are right',
    ...(d.newSource ? ['- [ ] Source record is right; set `verified` once checked', d.newSource.archiveUrl ? '' : '- [ ] Archive the source (no verified snapshot yet)'].filter(Boolean) : []),
    '- [ ] Key figures, questions and records flagged above checked by hand',
  ].join('\n')
  return { branch, title: d.amend ? `Draft: add to “${d.amend.title}”` : `Draft: ${d.entry.title}`, body, labels }
}

/** Unified diff of the data files with the draft's snippets inserted. */
export function makeDiff(d, dataRel = 'grayslake-impact/src/data') {
  const dir = mkdtempSync(join(tmpdir(), 'draft-diff-'))
  try {
    const files = applySnippets(d.rendered)
    for (const side of ['old', 'new']) mkdirSync(join(dir, side), { recursive: true })
    for (const f of DATA_FILES) {
      writeFileSync(join(dir, 'old', f), readFileSync(join(ROOT, 'src/data', f), 'utf8'))
      writeFileSync(join(dir, 'new', f), files[f])
    }
    let out = ''
    try {
      out = execFileSync('git', ['diff', '--no-index', '--no-color', 'old', 'new'], { cwd: dir, encoding: 'utf8' })
    } catch (e) {
      out = e.stdout ?? ''   // exit code 1 means "differences found"
    }
    return out.replace(/a\/old\//g, `a/${dataRel}/`).replace(/b\/new\//g, `b/${dataRel}/`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export function writeDryRun(store, dir, n, pr, diff, ghPreview) {
  const base = `${dir}/${String(n).padStart(2, '0')}-${slug(pr.branch.replace('pipeline/draft-', ''))}`
  store.writeText(`${base}.md`, `# ${pr.title}\n\nBranch: \`${pr.branch}\`\nLabels: ${pr.labels.join(', ')}\n\nWould run:\n\n\`\`\`\n${ghPreview}\n\`\`\`\n\n---\n\n${pr.body}\n`)
  store.writeText(`${base}.diff`, diff)
  return base
}

export function ghCommandPreview(pr, jcfg) {
  return `gh pr create --repo ${jcfg.site_repo.github} --base ${jcfg.site_repo.base} --head ${pr.branch} --title ${JSON.stringify(pr.title)} --body-file <body.md> ${pr.labels.map(l => `--label ${l}`).join(' ')}`
}

/**
 * Opens a real PR. run(cmd, args, opts) executes a command (injected so tests
 * can check the exact sequence without touching git or GitHub).
 */
export async function openLivePr(d, pr, { jcfg, liveFlag, run }) {
  if (!(jcfg.live === true && liveFlag === true)) throw new Error('live PRs need job.live: true in config AND the --live flag')
  if (!pr.branch.startsWith('pipeline/draft-') || pr.branch === jcfg.site_repo.base) throw new Error(`refusing to push to ${pr.branch}`)
  const repo = jcfg.site_repo.dir
  const wt = mkdtempSync(join(tmpdir(), 'pr-worktree-'))
  rmSync(wt, { recursive: true, force: true })
  try {
    await run('git', ['-C', repo, 'fetch', 'origin', jcfg.site_repo.base])
    await run('git', ['-C', repo, 'worktree', 'add', '-b', pr.branch, wt, `origin/${jcfg.site_repo.base}`])
    const files = applySnippets(d.rendered, join(wt, jcfg.site_repo.data_dir))
    for (const f of DATA_FILES) writeFileSync(join(wt, jcfg.site_repo.data_dir, f), files[f])
    await run('git', ['-C', wt, 'add', ...DATA_FILES.map(f => `${jcfg.site_repo.data_dir}/${f}`)])
    await run('git', ['-C', wt, 'commit', '-m', `${pr.title}\n\nDrafted by the research pipeline from ${d.url}`])
    await run('git', ['-C', wt, 'push', '-u', 'origin', pr.branch])
    const bodyFile = join(tmpdir(), `pr-body-${Date.now()}.md`)
    writeFileSync(bodyFile, pr.body)
    const out = await run(jcfg.gh, ['pr', 'create', '--repo', jcfg.site_repo.github, '--base', jcfg.site_repo.base, '--head', pr.branch, '--title', pr.title, '--body-file', bodyFile, ...pr.labels.flatMap(l => ['--label', l])])
    return { url: String(out ?? '').trim().split('\n').pop() }
  } finally {
    await run('git', ['-C', repo, 'worktree', 'remove', '--force', wt]).catch(() => {})
  }
}
