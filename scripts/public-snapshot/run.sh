#!/usr/bin/env bash
# Build a CLEANED copy of this repository's history for a new public repository.
#
#   run.sh [--ref <ref>] [--staging <dir>] [--skip-tests]    build and verify the cleaned copy, then stop
#   run.sh --push <url> [--staging <dir>]                     push the verified copy (asks you to type the repo name)
#
# It never changes this working copy and never pushes unless --push is given. See README.md.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_REPO="$(git -C "$HERE" rev-parse --show-toplevel)"
SRC_REF="refs/heads/main"
STAGING="$SRC_REPO/../satya-eoa-public-staging"
PUSH_URL=""
SKIP_TESTS=0
MARKER="satya-public-snapshot-verified"

ALLOWED_NAME_TOP="GM-Hrishi"
ALLOWED_EMAIL_TOP="GM-Hrishi@users.noreply.github.com"
OTHER_NAME="OneVision team member"
OTHER_EMAIL="team@onevision.invalid"

die() { echo "ERROR: $*" >&2; exit 1; }
say() { printf '\n== %s\n' "$*"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref) SRC_REF="${2:?--ref needs a value}"; shift 2 ;;
    --staging) STAGING="${2:?--staging needs a value}"; shift 2 ;;
    --push) PUSH_URL="${2:?--push needs a repository URL}"; shift 2 ;;
    --skip-tests) SKIP_TESTS=1; shift ;;
    -h|--help) sed -n '2,8p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

# 1. Copy this tool's own config first: the rewritten history does not contain it, and the working copy is never edited.
CONF="$(mktemp -d)"
trap 'rm -rf "$CONF"' EXIT
cp "$HERE"/mailmap.txt "$HERE"/paths-remove.txt "$HERE"/replace-text.txt "$HERE"/scan-patterns.txt "$HERE"/verify.sh "$CONF"/
strip() { grep -v -E '^[[:space:]]*(#|$)' "$1" || true; }

# ---------------------------------------------------------------- push mode
if [[ -n "$PUSH_URL" ]]; then
  [[ -d "$STAGING" ]] || die "no staging copy at $STAGING. Run $0 without --push first."
  head_sha="$(git -C "$STAGING" rev-parse refs/heads/main)"
  [[ -f "$STAGING/$MARKER" ]] || die "$STAGING was not verified by run.sh. Run $0 again."
  [[ "$(cat "$STAGING/$MARKER")" == "$head_sha" ]] || die "staging main changed after verification. Run $0 again."
  say "Re-running verify.sh"
  bash "$CONF/verify.sh" "$STAGING" --conf "$CONF" --skip-tests
  repo_name="$(basename "${PUSH_URL%.git}")"
  echo
  echo "About to push refs/heads/main and all tags of the cleaned copy to: $PUSH_URL"
  remote_refs="$(git ls-remote "$PUSH_URL" 2>&1)" || die "cannot reach $PUSH_URL (check the URL and your GitHub sign-in): $remote_refs"
  if [[ -n "$remote_refs" ]]; then
    # Not the first publication: allowed only as a fast-forward of the target's main (same rewritten history, more commits).
    git -C "$STAGING" fetch -q "$PUSH_URL" refs/heads/main:refs/satya-remote-check \
      || die "the target repository is not empty and has no main branch. Use an EMPTY repository for the first publication."
    if git -C "$STAGING" merge-base --is-ancestor refs/satya-remote-check refs/heads/main; then
      echo "The target already has history that is contained in the new main: this is a fast-forward update."
      git -C "$STAGING" update-ref -d refs/satya-remote-check
    else
      git -C "$STAGING" update-ref -d refs/satya-remote-check
      die "the target's main is not an ancestor of the new main (history was rewritten differently). Nothing pushed; create a new empty repository instead."
    fi
  fi
  read -r -p "Type the repository name ($repo_name) to confirm: " answer
  [[ "$answer" == "$repo_name" ]] || die "name did not match, nothing pushed"
  git -C "$STAGING" push "$PUSH_URL" refs/heads/main:refs/heads/main
  git -C "$STAGING" push "$PUSH_URL" --tags
  echo "Pushed. Next: turn on private vulnerability reporting, secret scanning and push protection; protect main."
  exit 0
fi

# ---------------------------------------------------------------- build mode
say "Checking the source"
git -C "$SRC_REPO" rev-parse --verify --quiet "$SRC_REF^{commit}" >/dev/null || die "source ref $SRC_REF not found"
src_sha="$(git -C "$SRC_REPO" rev-parse "$SRC_REF")"
if [[ "$SRC_REF" == "refs/heads/main" ]] && git -C "$SRC_REPO" rev-parse --verify --quiet refs/remotes/origin/main >/dev/null; then
  [[ "$src_sha" == "$(git -C "$SRC_REPO" rev-parse refs/remotes/origin/main)" ]] \
    || echo "WARNING: local main differs from origin/main. Run 'git pull' on main first unless you mean this."
fi
if [[ -n "$(git -C "$SRC_REPO" status --porcelain)" ]]; then
  echo "NOTE: the working copy has uncommitted changes; they are not part of the snapshot (only commits are)."
fi
[[ ! -e "$STAGING" ]] || die "$STAGING already exists. Delete it (rm -rf) and run again; this tool never reuses or overwrites it."
command -v git-filter-repo >/dev/null 2>&1 || { echo "git-filter-repo not found; installing with pip --user"; pip install --user git-filter-repo || die "could not install git-filter-repo (pip install git-filter-repo)"; export PATH="$HOME/.local/bin:$PATH"; }
command -v git-filter-repo >/dev/null 2>&1 || die "git-filter-repo is not on PATH after installation"

say "Cloning a fresh mirror into $STAGING"
git clone --no-local --mirror "$SRC_REPO" "$STAGING" >/dev/null 2>&1
cd "$STAGING"

# Point main at the requested ref, then delete every other branch and ref. Tags are kept.
git update-ref refs/heads/main "$src_sha"
git symbolic-ref HEAD refs/heads/main
{ git for-each-ref --format='%(refname)' | grep -v -E '^refs/(heads/main$|tags/)' || true; } | while read -r ref; do git update-ref -d "$ref"; done

# Every identity in the kept history: authors, committers and annotated-tag taggers (name TAB email).
identities() {
  git log refs/heads/main --tags --format='%an%x09%ae%n%cn%x09%ce'
  git for-each-ref refs/tags --format='%(taggername)%x09%(taggeremail)' | tr -d '<>'
}
say "Identities found (names only)"
identities | awk -F'\t' 'NF && $2 != "" {print "  " $1}' | sort -u
mapgen="$CONF/mailmap.generated"
: > "$mapgen"
lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }
overrides="$(strip "$CONF/mailmap.txt" | grep -o -i -E '<[^>]+>' | tr '[:upper:]' '[:lower:]' || true)"
allowed_email() {
  case "$(lower "$1")" in
    noreply@github.com|noreply@anthropic.com|*@users.noreply.github.com) return 0 ;;
    *) return 1 ;;
  esac
}
# The identity that AUTHORED the most commits becomes the owner; everyone else becomes a generic team member.
top_email="$(git log refs/heads/main --tags --format='%ae' | sort | uniq -c | sort -rn \
  | while read -r _ email; do if ! allowed_email "$email"; then lower "$email"; break; fi; done || true)"
# Matching is by email address only (git mailmap form "Name <new> <old>"), so any display name used with it is covered.
while IFS=$'\t' read -r _ email; do
  [[ -n "$email" ]] || continue
  allowed_email "$email" && continue
  if printf '%s\n' "$overrides" | grep -q -F "<$(lower "$email")>"; then continue; fi
  if [[ "$(lower "$email")" == "$top_email" ]]; then
    echo "$ALLOWED_NAME_TOP <$ALLOWED_EMAIL_TOP> <$email>" >> "$mapgen"
  else
    echo "$OTHER_NAME <$OTHER_EMAIL> <$email>" >> "$mapgen"
  fi
done < <(identities | sort -u)
sort -u -o "$mapgen" "$mapgen"
{ strip "$CONF/mailmap.txt"; cat "$mapgen"; } > "$CONF/mailmap.all"
strip "$CONF/paths-remove.txt" > "$CONF/paths.stripped"
strip "$CONF/replace-text.txt" > "$CONF/replace.stripped"

commits_before="$(git rev-list --count refs/heads/main)"
authors_before="$(git log refs/heads/main --tags --format='%an%n%cn' | sort -u | wc -l | tr -d ' ')"

say "Rewriting history (authors, removed paths, scrubbed text, trailers)"
git filter-repo \
  --mailmap "$CONF/mailmap.all" \
  --paths-from-file "$CONF/paths.stripped" --invert-paths \
  --replace-text "$CONF/replace.stripped" \
  --replace-message "$CONF/replace.stripped" \
  >"$CONF/filter-repo.log" 2>&1 || { tail -n 20 "$CONF/filter-repo.log" >&2; die "git-filter-repo failed (output above)"; }
git symbolic-ref HEAD refs/heads/main
{ git for-each-ref --format='%(refname)' | grep -v -E '^refs/(heads/main$|tags/)' || true; } | while read -r ref; do git update-ref -d "$ref"; done
git reflog expire --expire=now --all
git gc --prune=now --aggressive -q

commits_after="$(git rev-list --count refs/heads/main)"
authors_after="$(git log refs/heads/main --tags --format='%an%n%cn' | sort -u | wc -l | tr -d ' ')"

say "Verifying"
verify_args=("$STAGING" --conf "$CONF" --source "$SRC_REPO" --ref "$src_sha")
[[ "$SKIP_TESTS" == 1 ]] && verify_args+=(--skip-tests)
bash "$CONF/verify.sh" "${verify_args[@]}"
git rev-parse refs/heads/main > "$STAGING/$MARKER"

say "Summary"
echo "  commits on main:      $commits_before before, $commits_after after"
echo "  distinct names:       $authors_before before, $authors_after after (authors and committers)"
echo "  staging copy:         $STAGING (no remote is configured)"
echo "  main is now:          $(git rev-parse --short refs/heads/main)"
git for-each-ref --format='  ref: %(refname)' | head -30
cat <<EOF

Nothing was pushed. To publish (replace OWNER and the repository name if you chose another):

  1. On GitHub create an EMPTY repository (no README, no licence, no .gitignore), e.g. OWNER/satya-eoa-sih26261.
  2. Push the verified copy; you will be asked to type the repository name:
       $HERE/run.sh --push https://github.com/OWNER/satya-eoa-sih26261.git
     or by hand:
       cd "$STAGING"
       git remote add public https://github.com/OWNER/satya-eoa-sih26261.git
       git push public refs/heads/main:refs/heads/main
       git push public --tags
EOF
