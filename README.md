# CompanyCam TypeScript SDK

Welcome to the home of the official CompanyCam TypeScript SDK. This project turns the public OpenAPI specification into a modern, well-typed client that developers can rely on when integrating with CompanyCam. We are glad you are here and would love your help shaping a dependable, community-driven toolkit.

Our focus is to provide:

- **Accurate coverage of the API** by generating everything directly from the published OpenAPI spec.
- **First-class TypeScript ergonomics** so you can enjoy autocompletion, safety, and predictable developer experience.
- **Clear contribution paths** for anyone who wants to improve the SDK, documentation, or automation.

Thank you for your interest in contributing—your ideas, issues, and improvements are always welcome. Dive in, explore the spec-powered code, and let us know how we can make the SDK even better for you.

## Contributing

Before getting started, please read our [Contributing Guide](CONTRIBUTING.md) for details on development workflows, changelog expectations, and review requirements.

## Changelog and versioning

We follow [Semantic Versioning](https://semver.org/) and automate releases with [semantic-release](https://semantic-release.gitbook.io/semantic-release/). Merges to `main` with Conventional Commit messages trigger the pipeline to:

- determine the next version number;
- publish the package to npm;
- generate release notes and update [`CHANGELOG.md`](CHANGELOG.md);
- create a GitHub release and tag.

No manual version bumps or changelog edits are required—just keep commit messages compliant with the Conventional Commits specification.
