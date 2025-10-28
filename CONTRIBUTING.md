# Contributing to the CompanyCam TypeScript SDK

We are excited to have you collaborate on the CompanyCam TypeScript SDK. This document outlines how to get involved, the workflows we follow, and what we expect before changes are merged.

## Getting Started

1. **Discuss your idea** – Open an issue to describe bugs, enhancements, or questions before you begin.
2. **Set up your environment** – Install the required tooling and clone this repository.
3. **Read the OpenAPI spec** – The `companycam-openapi-spec.yaml` file is the single source of truth for all generated outputs.

## Development Workflow

1. **Create a feature branch** from `main`.
2. **Implement your changes** following the guidelines in [`agents.md`](agents.md).
3. **Add or update tests** when applicable. (Testing scripts will be documented alongside the generated code.)
4. **Generate or update artifacts** from the OpenAPI spec as needed.
5. **Ensure linting and formatting** match existing standards when they become available in the project.

## Versioning and Changelog Management

We follow [Semantic Versioning](https://semver.org/) and use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) to ship packages. To keep the automation happy:

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) in every pull request so semantic-release can determine the correct version bump.
- Do **not** edit [`CHANGELOG.md`](CHANGELOG.md) or the package version manually—the release workflow updates them after each merge to `main`.

## Pull Request Checklist

Before requesting a review:

- [ ] Make sure your branch is rebased onto the latest `main`.
- [ ] Confirm that all generated files stay in sync with `companycam-openapi-spec.yaml`.
- [ ] Resolve **all** GitHub Copilot review comments if Copilot opens a review on your PR.
- [ ] Ensure tests and quality checks pass locally.
- [ ] Ensure your commits follow the Conventional Commits spec so semantic-release can infer the next version.

When the checklist is complete, request a review from **@jmiller-pwi**. A human reviewer will merge once everything looks good.

## Code of Conduct

We expect all contributors to act respectfully and constructively. Reports of unacceptable behavior can be submitted privately to the maintainers.

Thank you for helping make the CompanyCam TypeScript SDK a reliable tool for the community!
