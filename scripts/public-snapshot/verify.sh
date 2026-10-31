#!/usr/bin/env bash
# Check a cleaned mirror made by run.sh. Exit 0 only if every check passes.
#
#   verify.sh <staging-dir> [--conf <dir>] [--source <repo> --ref <sha>] [--skip-tests]
#
#   --conf     directory with paths-remove.txt and scan-patterns.txt (default: next to this script)
#   --source   the private repository, to prove the cleaned tree equals the source tree minus the removed paths
#   --skip-tests  skip the checkout, install, lint, type and test steps (fast mode)
# Values of emails or matches are never printed: only the kind, the revision and the path.
set -uo pipefail

STAGING="${1:?usage: verify.sh <staging-dir> [--conf <dir>] [--source <repo> --ref <sha>] [--skip-tests]}"
shift
CONF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE=""
REF=""
SKIP_TESTS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --conf) CONF="${2:?}"; shift 2 ;;
    --source) SOURCE="${2:?}"; shift 2 ;;
    --ref) REF="${2:?}"; shift 2 ;;
    --skip-tests) SKIP_TESTS=1; shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done
[[ -d "$STAGING" ]] || { echo "no such directory: $STAGING" >&2; exit 2; }

fail=0
ok() { echo "  ok    $*"; }
bad() { echo "  FAIL  $*"; fail=1; }
strip() { grep -v -E '^[[:space:]]*(#|$)' "$1" || true; }
G() { git -C "$STAGING" "$@"; }

revs="$(G rev-list --all | tr '\n' ' ')"
# shellcheck disable=SC2086
[[ -n "$revs" ]] || { echo "the mirror has no commits" >&2; exit 2; }

echo "== Refs"
extra="$(G for-each-ref --format='%(refname)' | grep -v -E '^refs/(heads/main|tags/.+)$' || true)"
if [[ -z "$extra" ]]; then ok "only refs/heads/main and tags exist"; else bad "other refs exist: $(echo "$extra" | wc -l | tr -d ' ') (for example $(echo "$extra" | head -n 3 | tr '\n' ' '))"; fi
if G rev-parse --verify --quiet refs/heads/main >/dev/null; then ok "main exists"; else bad "main is missing"; fi
tag_bad=0
while read -r t; do
  [[ -n "$t" ]] || continue
  G cat-file -e "$t^{commit}" 2>/dev/null || { bad "tag $t does not point to an existing commit"; tag_bad=1; }
done < <(G for-each-ref --format='%(refname)' refs/tags)
if [[ $tag_bad == 0 ]]; then ok "all tag targets exist"; fi
if G fsck --full --strict >/dev/null 2>&1; then ok "git fsck passes"; else bad "git fsck reports problems"; fi

echo "== Emails (blobs of every revision, commit messages, identities, tags)"
EMAIL_RE='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
is_allowed() {
  local e
  e="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  case "$e" in
    noreply@github.com|noreply@anthropic.com|*@users.noreply.github.com|*@example.com|*.invalid|*.test) return 0 ;;
    *) return 1 ;;
  esac
}
bad_mail=0
# shellcheck disable=SC2086
while read -r e; do
  [[ -n "$e" ]] || continue
  is_allowed "$e" || bad_mail=$((bad_mail + 1))
done < <({ G grep -I -h -o -i -E "$EMAIL_RE" $revs -- . ':!*.pdf' ':!*.png' ':!*.woff2' 2>/dev/null
           G log --all --format='%ae%n%ce%n%B'
           G for-each-ref refs/tags --format='%(taggeremail)%0a%(contents)' | tr -d '<>'; } | grep -o -E "$EMAIL_RE")
if [[ $bad_mail == 0 ]]; then ok "no email other than the allowed ones"; else bad "$bad_mail email occurrence(s) outside the allow-list (locate with git grep -I -l -E over all revisions)"; fi

echo "== Scan patterns"
exclude=(':!*.pdf' ':!*.png' ':!*.jpg' ':!*.woff2' ':!pnpm-lock.yaml' ':!uv.lock')
while IFS='|' read -r label regex; do
  [[ -n "$label" && -n "$regex" ]] || continue
  flags=(-E)
  if [[ "$label" == *"(i)" ]]; then flags=(-E -i); label="${label% (i)}"; fi
  scope=(-- .)
  case "$label" in phone*|Aadhaar*|PAN*) scope=(-- . "${exclude[@]}") ;; esac
  # shellcheck disable=SC2086
  files="$(G grep -I -l "${flags[@]}" -e "$regex" $revs "${scope[@]}" 2>/dev/null | sed -E 's/^[0-9a-f]{7}[0-9a-f]*:/ /' | sort | uniq -c | head -n 8)"
  msgs="$(G log --all --format='%an%n%ae%n%cn%n%ce%n%B' | grep -c "${flags[@]}" -e "$regex" || true)"
  if [[ -z "$files" && "$msgs" == 0 ]]; then
    ok "no hits: $label"
  else
    bad "hits for: $label"
    if [[ -n "$files" ]]; then printf '%s\n' "$files" | awk '{print "          in file: " $0}'; fi
    if [[ "$msgs" != 0 ]]; then echo "          in commit messages or identities: $msgs line(s)"; fi
  fi
done < <(strip "$CONF/scan-patterns.txt")

echo "== Removed paths"
tmp_all="$(mktemp)"
G log --all --name-only --format= | sort -u > "$tmp_all"
removed_bad=0
while read -r p; do
  p="${p%/}"
  esc="$(printf '%s' "$p" | sed 's/[][\.*^$/]/\\&/g')"
  if grep -q -E "^${esc}(/|\$)" "$tmp_all"; then bad "removed path still exists in some revision: $p"; removed_bad=1; fi
done < <(strip "$CONF/paths-remove.txt")
if [[ $removed_bad == 0 ]]; then ok "no removed path in any revision"; fi
rm -f "$tmp_all"

echo "== Identities (names only)"
G log --all --format='%an%n%cn' | sort -u | sed 's/^/          /'

if [[ -n "$SOURCE" && -n "$REF" ]]; then
  echo "== Tree equals source minus removed paths"
  want="$(mktemp)"; got="$(mktemp)"
  git -C "$SOURCE" ls-tree -r --full-tree "$REF" | awk -F'\t' -v conf="$CONF/paths-remove.txt" '
    BEGIN { while ((getline l < conf) > 0) { if (l ~ /^[[:space:]]*(#|$)/) continue; sub(/\/$/, "", l); rm[++n] = l } }
    { drop = 0; for (i = 1; i <= n; i++) if ($2 == rm[i] || index($2, rm[i] "/") == 1) { drop = 1; break } if (!drop) print }' | sort > "$want"
  G ls-tree -r --full-tree refs/heads/main | sort > "$got"
  if diff -q "$want" "$got" >/dev/null; then
    ok "cleaned main tree equals the source tree minus the removed paths ($(wc -l < "$got" | tr -d ' ') files)"
  else
    bad "tree differs from the source minus removed paths:"
    diff "$want" "$got" | awk -F'\t' '{print "          " $0}' | cut -c1-160 | head -n 20
  fi
  rm -f "$want" "$got"
fi

if [[ "$SKIP_TESTS" == 0 ]]; then
  echo "== Checkout of cleaned main: guard, install, lint, types, tests"
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT
  if git clone -q "$STAGING" "$work/co"; then
    step() {
      local name="$1"; shift
      if (cd "$work/co" && "$@") >"$work/$name.log" 2>&1; then ok "$name"; else bad "$name (last lines below)"; tail -n 15 "$work/$name.log" | sed 's/^/          /'; fi
    }
    step "real-data guard" bash infra/scripts/real-data-guard.sh
    step "pnpm install" pnpm install --frozen-lockfile
    step "uv sync" uv sync --all-packages --frozen
    step "synthetic files up to date" make synth-check
    step "lint" make lint
    step "types" make typecheck
    step "unit tests" make test
    if command -v gitleaks >/dev/null 2>&1; then
      step "gitleaks (full history)" gitleaks git . --redact --no-banner --config .gitleaks.toml
    else
      echo "  note  gitleaks not installed here; the public repository's CI runs it on every push"
    fi
  else
    bad "could not clone the cleaned mirror for the test checkout"
  fi
else
  echo "== Tests skipped (--skip-tests): guard, install, lint, types, unit tests, gitleaks not run"
fi

echo
if [[ $fail == 0 ]]; then echo "VERIFY: all checks passed"; else echo "VERIFY: FAILED"; fi
exit "$fail"
