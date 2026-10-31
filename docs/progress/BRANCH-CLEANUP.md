# Branch and tag cleanup (manual steps for the team)
Checked 26 Oct 2026. The session's git credentials got HTTP 403 for tag pushes and remote branch deletes (not retried).

## Merge check
GitHub squash-merged slices 0 to 2, so git ancestry says "not merged" for some branches. Content check against `main`:
| Branch | Result |
|---|---|
| `claude/pensive-rubin-eudosj` | ancestor of main (0 commits ahead); fully merged (slice 0, PR 1) |
| `claude/slice-1-m5-affidavit-diff` | 16 commits ahead by ancestry, but its tree equals the slice 1 squash commit `9fc5f49` except 5 older doc lines that main has since superseded (team answers on licence, issues, priorities); nothing unmerged of value |
| `claude/wonderful-mccarthy-ewqweb` (slice 2, PR 4) | tree identical to main; fully merged |

## Tags (run on a laptop with push rights)
```
git fetch origin
git tag -a slice-0-foundation        bccc995 -m "Slice 0: foundation"
git tag -a slice-1-m5-affidavit-diff 9fc5f49 -m "Slice 1: M5 affidavit diff (P-3)"
git tag -a slice-2-m6-signatures     459cbde -m "Slice 2: M6 signatures, stamp, UDIN (P-4, P-18)"
git push origin slice-0-foundation slice-1-m5-affidavit-diff slice-2-m6-signatures
```

## Delete merged remote branches
```
git push origin --delete claude/pensive-rubin-eudosj claude/slice-1-m5-affidavit-diff claude/wonderful-mccarthy-ewqweb
```
Or GitHub UI: Code > Branches > trash icon on each of the three. Optionally enable Settings > General > "Automatically delete head branches".
