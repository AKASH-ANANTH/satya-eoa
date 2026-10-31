# Public snapshot tooling

Builds a CLEANED copy of this repository's history for a NEW public repository. The private repository keeps its full history and every file; nothing is removed from `main` here. These scripts are themselves removed from the snapshot.

## What it does

`run.sh` (never touches this working copy, never pushes unless `--push` is given):

1. Copies its own config files to a temporary folder.
2. Makes a fresh `git clone --no-local --mirror` of this repository into `../satya-eoa-public-staging` (it refuses to reuse an existing folder).
3. Uses `git-filter-repo` (installs it with `pip install --user git-filter-repo` if missing).
4. Keeps only `refs/heads/main` and all tags; deletes every other branch and ref (this drops any open feature branch).
5. Rewrites ALL commits:
   - authors and committers through the mailmap (see below);
   - every path in `paths-remove.txt` removed from every revision;
   - every expression in `replace-text.txt` scrubbed from every text blob and every commit message (other-domain emails become `redacted`; `Claude-Session:` trailers are dropped; `Co-Authored-By` lines stay);
6. Runs `verify.sh` on the result.
7. Prints the commands to create the new repository and push to it, then stops.

`run.sh --push <url>` pushes the verified copy. It re-runs the verification, accepts an EMPTY target repository (first publication) or one whose `main` is an ancestor of the new `main` (a later fast-forward update), refuses anything else, and asks you to type the repository name before pushing `main` and the tags.

## Files

| File | Purpose |
|---|---|
| `run.sh` | Build the cleaned copy, or push it (`--push`). Options: `--ref <ref>` (publish this ref as `main`, default `refs/heads/main`), `--staging <dir>`, `--skip-tests`. |
| `verify.sh` | Checks the cleaned copy (usable on its own: `verify.sh <dir>`). |
| `mailmap.txt` | Identity overrides. Empty by default; see below. |
| `paths-remove.txt` | Paths removed from every revision. |
| `replace-text.txt` | Text scrubbed from every blob and commit message. |
| `scan-patterns.txt` | Patterns that must have zero hits after cleaning. |

## Authors

Defaults are generated from the history, so no personal email is written in this repository:

- the identity that authored the most commits becomes `GM-Hrishi <GM-Hrishi@users.noreply.github.com>`;
- every other author or committer identity becomes `OneVision team member <team@onevision.invalid>`;
- `noreply@github.com`, `noreply@anthropic.com` and any `*@users.noreply.github.com` address stay as they are.

To credit a teammate with a real GitHub account, add a line to `mailmap.txt` (the comment block there shows the format). Use a `users.noreply.github.com` address only for a handle you are sure about: a wrong handle credits someone else's real account.

## What `verify.sh` checks

- only `main` and tags exist; every tag points to an existing commit; `git fsck --full --strict` passes;
- no email address outside the allow-list, in any blob, commit message, identity or tag;
- no hit for any pattern in `scan-patterns.txt` (phone, Aadhaar-like, PAN-like, college name, other team names, blind-run wording, session trailers);
- no path from `paths-remove.txt` in any revision (`git log --all --name-only`);
- with `--source`: the cleaned `main` tree equals the source tree minus the removed paths;
- unless `--skip-tests`: in a checkout of the cleaned `main`, the real-data guard, `pnpm install`, `uv sync`, `make synth-check`, `make lint`, `make typecheck`, `make test`, and gitleaks if it is installed.

Requirements: `git` 2.30 or newer, `bash` 4 or newer, Python 3 with `pip`; for the test step also `pnpm`, `uv` and `make` (see the root README).

## Typical use

```bash
git checkout main && git pull
scripts/public-snapshot/run.sh                      # builds, verifies, prints the summary
scripts/public-snapshot/run.sh --push https://github.com/OWNER/REPO.git
```

The rewrite is deterministic: running it again over unchanged history gives the same commit hashes, so later pushes to the public repository are ordinary fast-forwards. If `paths-remove.txt`, `replace-text.txt` or the mailmap change, hashes change and the public `main` must be recreated.
