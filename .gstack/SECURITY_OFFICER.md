# GStack Security Officer Compliance Policy

## Security Requirements
1. **Zero Secret Capture**: Environment variables, API keys, passwords, and tokens must never be logged or exported to skill markdown files.
2. **Directory Traversal Protection**: Session IDs are strictly sanitized (`/^[A-Za-z0-9][A-Za-z0-9._-]*$/`) to prevent path escape vulnerabilities.
3. **Local Storage Privacy**: Session stores default to user home directory (`~/.gemini/antigravity-cli/sessions/`) with strict read/write access.
