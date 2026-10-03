# AIWF Codex delegation

Optional AIWF extension with the `delegate-codex` skill. Codex users may select it through `scripts/install-spec-skills.mjs --delegate codex`; Claude Code users may install this plugin from the AIWF marketplace. The skill can also be installed individually through skills.sh:

```bash
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-codex --agent claude-code
```

These GitHub commands work after this change is published to the repository. Installation does not run the skill, install or authenticate Codex, or change either host's permissions. Invoke `delegate-codex` explicitly when work should go to Codex. On Codex, the manual installer names it `$aiwf-delegate-codex`; Claude Code marketplace users invoke `/aiwf-delegate-codex:delegate-codex`. A cross-CLI invocation requires the literal `--cross-cli` token in the current request.
