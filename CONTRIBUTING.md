# Contributing to the CompanyCam TypeScript SDK

We are excited to have you collaborate on the CompanyCam TypeScript SDK. This document outlines how to get involved, the workflows we follow, and what we expect before changes are merged.

## Getting Started

1. **Discuss your idea** - Open an issue to describe bugs, enhancements, or questions before you begin.
2. **Set up your environment** - Install the required tooling and clone this repository.
3. **Familiarize yourself with the OpenAPI spec** - The `companycam-openapi-spec.yaml` file is the single source of truth for all functionality. Sourced from [CompanyCam/openapi-spec](https://github.com/CompanyCam/openapi-spec).

## Development Workflow

1. **Create a new branch** from `main`.
2. **Implement your changes** following the guidelines in [`agents.md`](agents.md).
3. **Add or update tests** for every behavioral change, then run `npm test` to verify the suite passes before moving on. New features must ship with accompanying tests that demonstrate the change.
4. **Generate or update artifacts** from the OpenAPI spec as needed.
5. **Ensure linting and formatting** match existing standards when they become available in the project.
6. **Ensure commit messages** are detailed and follow Conventional Commits formatting (see [Commit message guidelines](#commit-message-guidelines)).

## Versioning, Releases, and Changelog Management

We follow [Semantic Versioning](https://semver.org/) and automate releases with [semantic-release](https://semantic-release.gitbook.io/semantic-release/). To keep the automation happy and ensure a smooth release process:

- **Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)** in every pull request so semantic-release can determine the correct version bump.
- **Do not edit [`CHANGELOG.md`](CHANGELOG.md) or the package version manually**—the release workflow updates them after each merge to `main`.
- **Merges to `main` with Conventional Commit messages trigger the release pipeline to:**
  - determine the next version number;
  - publish the package to npm;
  - generate release notes and update [`CHANGELOG.md`](CHANGELOG.md);
  - create a GitHub release and tag.

No manual version bumps or changelog edits are required—just keep commit messages compliant with the Conventional Commits specification.

### Conventional Commit message guidelines

This repository enforces Conventional Commits with commitlint to keep the semantic-release pipeline running smoothly. You can commit in either of the following ways:

- Use the guided prompt: `npm run commit`
- Craft your own commit message and let the hook validate it on `git commit`

Refer to the Conventional Commits specification below for the allowed prefixes. If the hook blocks your commit, adjust the message to match the format: `type(scope): short description`.

#### Allowed prefixes and release impact

Semantic-release inspects the `type` field of your commit messages to determine how to version the next release. Use the table below to choose the appropriate prefix for your commit:

|     | Prefix     | Title                    | Description                                                          | Version impact\* |
| --- | ---------- | ------------------------ | -------------------------------------------------------------------- | ---------------- |
| ✨  | `feat`     | Features                 | A new feature                                                        | Minor            |
| 🐛  | `fix`      | Bug Fixes                | A bug fix                                                            | Patch            |
| 📚  | `docs`     | Documentation            | Documentation only changes                                           | Patch            |
| 💎  | `style`    | Styles                   | Changes that do not affect the meaning of the code (e.g. formatting) | Patch            |
| 📦  | `refactor` | Code Refactoring         | A code change that neither fixes a bug nor adds a feature            | Patch            |
| 🚀  | `perf`     | Performance Improvements | A code change that improves performance                              | Patch            |
| 🚨  | `test`     | Tests                    | Adding missing tests or correcting existing tests                    | Patch            |
| 🛠   | `build`    | Builds                   | Changes that affect the build system or external dependencies        | Patch            |
| ⚙️  | `ci`       | Continuous Integrations  | Changes to our CI configuration files and scripts                    | Patch            |
| ♻️  | `chore`    | Chores                   | Other changes that don't modify src or test files                    | Patch            |
| 🗑   | `revert`   | Reverts                  | Reverts a previous commit                                            | Patch            |

\* Append `!` to any type (for example, `feat!`) or include `BREAKING CHANGE:` in the body to signal a **major** version bump.

#### Passing commit examples

- `feat(http): add retry jitter to axios client`
- `fix(rate-limiter): prevent token leak on abort`
- `docs: document commit message flow`
- `chore!: drop Node 18 support (BREAKING CHANGE: requires Node 20)`

## Pull Request Checklist

Before requesting a review:

- [ ] Create a Github Issue describing what problem you are trying to solve (e.g. a bug you found or a feature you want to add).
- [ ] Make sure your branch is up to date with the latest changes from `main`.
- [ ] Confirm that all files stay in sync with `companycam-openapi-spec.yaml`.
- [ ] Use a PR title that follows the Conventional Commits spec so semantic-release can properly infer the next version.
- [ ] If GitHub Copilot opens a review on your PR, make sure to resolve every Copilot comment—either implement the suggested changes or mark the comment as resolved if it is not valid.
- [ ] Verify all tests and quality checks pass.
- [ ] Include a detailed list of changes in your PR description so that semantic-release can properly update the change log.

When the checklist is complete, request a review from **@jmiller-pwi**. A human reviewer will merge once everything looks good.

## Code of Conduct

We expect all contributors to act respectfully and constructively. Reports of unacceptable behavior can be submitted privately to the maintainers.

Thank you for helping make the CompanyCam TypeScript SDK a reliable tool for the community!
