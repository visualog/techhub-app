---
description: Automates the git push process including checking status, adding files, generating a Korean commit message, and pushing to remote.
---

1. Check the current git status to see what has changed.
    - Run `git status`

2. If there are changes, stage all of them.
    - Run `git add .`

3. Generate a concise and descriptive commit message in **Korean** (한글) based on the changes.
    - Analyze the `git status` output and any recent changes.
    - Format: `[Type]: [Description]` (e.g., `feat: 새로운 기능 추가`, `fix: 버그 수정`)
    - Run `git commit -m "your_generated_message"`

4. Push the changes to the current branch on the remote repository.
    - Run `git push`

5. Confirm the push was successful.
