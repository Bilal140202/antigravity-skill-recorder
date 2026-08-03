# GStack QA Lead Quality Assurance Standards

## Testing Protocol
1. **Automated Unit Tests**: Standard Node test runner (`node --test`) verifying session store creation, event serialization, analysis, and skill generation.
2. **Command Verification**: System doctor (`agy-skill-recorder doctor`) ensuring runtime binary and environmental readiness.
3. **End-to-End Replay**: Verification of trajectory timeline playback (`agy-skill-recorder play`).
