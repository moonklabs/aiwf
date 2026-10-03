# AIWF Claude delegation

Optional AIWF extension with the `delegate-claude` skill. Claude Code installs it from the AIWF marketplace; Codex users may select the skill through `scripts/install-spec-skills.mjs --delegate claude`. The skill can also be installed individually through skills.sh:

```bash
npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent codex
npx skills add https://github.com/moonklabs/aiwf --skill delegate-claude --agent claude-code
```

These GitHub commands work after this change is published to the repository. Installation does not run the skill, install or authenticate Claude Code, or change either host's permissions. Invoke `delegate-claude` explicitly when work should go to Claude. On Codex, the manual installer names it `$aiwf-delegate-claude`; Claude Code marketplace users invoke `/aiwf-delegate-claude:delegate-claude`. A cross-CLI invocation requires the literal `--cross-cli` token in the current request.
