# GlassMind — Contributing Guide

Thank you for contributing to GlassMind! Please follow these guidelines to ensure a smooth collaboration.

## Branch Strategy

We use a **trunk-based development** model:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected branch. |
| `develop` | Integration branch for features. |
| `feature/<name>` | New features (branch from `develop`) |
| `fix/<name>` | Bug fixes (branch from `develop`) |
| `hotfix/<name>` | Urgent production fixes (branch from `main`) |

### Creating a Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |
| `ci` | CI/CD changes |

### Examples

```
feat(chat): add streaming response support
fix(api): handle null confidence scores
docs(readme): update setup instructions
refactor(store): migrate to Zustand v5
```

## Pull Request Process

1. **Create a PR** from your feature branch to `develop`
2. **Fill in the PR template** completely
3. **Ensure CI passes** — all checks must be green
4. **Request review** from at least one team member
5. **Address feedback** promptly
6. **Squash and merge** when approved

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code has been performed
- [ ] Comments have been added where necessary
- [ ] Documentation has been updated if needed
- [ ] No new warnings are introduced
- [ ] Tests have been added for new functionality
- [ ] All existing tests pass

## Code Style

### Frontend (TypeScript)
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Use TypeScript strict mode — no `any` types
- Use absolute imports with path aliases

### Backend (Python)
- Follow Ruff linter configuration
- Use type hints on all function signatures
- Use async/await for I/O operations
- Follow the repository pattern for data access

## Getting Help

- Check the [Architecture Guide](ARCHITECTURE.md) for system design questions
- Check the [Setup Guide](SETUP.md) for environment issues
- Open a GitHub issue for bugs or feature requests
