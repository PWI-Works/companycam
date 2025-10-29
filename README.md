# CompanyCam TypeScript SDK

Welcome to the home of the official CompanyCam TypeScript SDK. This project turns the public OpenAPI specification into a modern, well-typed client that developers can rely on when integrating with CompanyCam. We are glad you are here and would love your help shaping a dependable, community-driven toolkit.

Our focus is to provide:

- **Accurate coverage of the API** by generating everything directly from the published OpenAPI spec.
- **First-class TypeScript ergonomics** so you can enjoy autocompletion, safety, and predictable developer experience.
- **Clear contribution paths** for anyone who wants to improve the SDK, documentation, or automation.

Thank you for your interest in contributing—your ideas, issues, and improvements are always welcome. Dive in, explore the spec-powered code, and let us know how we can make the SDK even better for you.

## Contributing

We welcome all contributions! Before getting started, please read our [Contributing Guide](CONTRIBUTING.md) for details on development workflows, changelog expectations, and review requirements.

## Changelog and versioning

We follow [Semantic Versioning](https://semver.org/) and automate releases with [semantic-release](https://semantic-release.gitbook.io/semantic-release/). Merges to `main` with Conventional Commit messages trigger the pipeline to:

- determine the next version number;
- publish the package to npm;
- generate release notes and update [`CHANGELOG.md`](CHANGELOG.md);
- create a GitHub release and tag.

No manual version bumps or changelog edits are required—just keep commit messages compliant with the Conventional Commits specification.

### Commit message guidelines

This repository enforces Conventional Commits with commitlint to keep the semantic-release pipeline running smoothly. You can commit in either of the following ways:

- Use the guided prompt: `npm run commit`
- Craft your own commit message and let the hook validate it on `git commit`

Refer to the Conventional Commits specification for the allowed prefixes (`feat`, `fix`, `chore`, etc.). If the hook blocks your commit, adjust the message to match the format: `type(scope): short description`.

#### Allowed prefixes and release impact

Semantic-release inspects the `type` field of your commit messages to determine how to version the next release. Use the table below to choose the appropriate prefix for your commit:

| Prefix | Title | Description | Emoji | Version impact* |
| --- | --- | --- | --- | --- |
| `feat` | Features | A new feature | ? | Minor |
| `fix` | Bug Fixes | A bug fix | ?? | Patch |
| `docs` | Documentation | Documentation only changes | ?? | Patch |
| `style` | Styles | Changes that do not affect the meaning of the code (white-space, formatting, etc) | ?? | Patch |
| `refactor` | Code Refactoring | A code change that neither fixes a bug nor adds a feature | ?? | Patch |
| `perf` | Performance Improvements | A code change that improves performance | ?? | Patch |
| `test` | Tests | Adding missing tests or correcting existing tests | ?? | Patch |
| `build` | Builds | Changes that affect the build system or external dependencies | ?? | Patch |
| `ci` | Continuous Integrations | Changes to our CI configuration files and scripts | ?? | Patch |
| `chore` | Chores | Other changes that don't modify src or test files | ?? | Patch |
| `revert` | Reverts | Reverts a previous commit | ?? | Patch |

* Append `!` to any type (for example, `feat!`) or include `BREAKING CHANGE:` in the body to signal a **major** version bump.

### Testing with Vitest

We rely on [Vitest](https://vitest.dev/) for unit testing. Tests live under the `test/` directory and follow the `*.test.ts` naming convention. To execute the suite locally, run:

```bash
npm test
```

Vitest runs in Node environment mode to keep the suite fast and aligned with the SDK's runtime. Helpful flags include:

- `npm run test -- --watch` to rerun tests when files change.
- `npm run test -- --coverage` to generate coverage reports.

Please add or update tests alongside any code change so the suite remains a reliable guardrail.

#### Passing commit examples

- `feat(http): add retry jitter to axios client`
- `fix(rate-limiter): prevent token leak on abort`
- `docs: document commit message flow`
- `chore!: drop Node 18 support (BREAKING CHANGE: requires Node 20)`

