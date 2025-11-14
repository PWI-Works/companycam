## 2.0.0 (2025-11-14)

* chore(release)!: force a patch release for breaking change ([540d2aa](https://github.com/PWI-Works/companycam/commit/540d2aa))
* feat!: change oauth endpoints to reduce user boilerplate ([f3d485d](https://github.com/PWI-Works/companycam/commit/f3d485d))
* feat!: change oauth functions to make direct api calls isntead ([0f09872](https://github.com/PWI-Works/companycam/commit/0f09872))
* feat!: use oauth api calls directly ([a1a7938](https://github.com/PWI-Works/companycam/commit/a1a7938))
* Merge branch 'main' of https://github.com/PWI-Works/companycam ([a69f87b](https://github.com/PWI-Works/companycam/commit/a69f87b))
* Merge pull request #11 from PWI-Works/improve-oauth-functionality ([21e5d7f](https://github.com/PWI-Works/companycam/commit/21e5d7f)), closes [#11](https://github.com/PWI-Works/companycam/issues/11)
* Merge pull request #12 from PWI-Works/improve-oauth-functionality ([d5927bb](https://github.com/PWI-Works/companycam/commit/d5927bb)), closes [#12](https://github.com/PWI-Works/companycam/issues/12)
* Merge pull request #13 from PWI-Works/revert-changes-to-re-stage-for-release ([153c4e2](https://github.com/PWI-Works/companycam/commit/153c4e2)), closes [#13](https://github.com/PWI-Works/companycam/issues/13)
* Merge pull request #14 from PWI-Works/new-oauth-functionality ([7039b72](https://github.com/PWI-Works/companycam/commit/7039b72)), closes [#14](https://github.com/PWI-Works/companycam/issues/14)
* refactor(oauth)!: replace oauth builder funtions with api calls ([5ce2d68](https://github.com/PWI-Works/companycam/commit/5ce2d68))
* Revert "Merge pull request #11 from PWI-Works/improve-oauth-functionality" ([1eba670](https://github.com/PWI-Works/companycam/commit/1eba670)), closes [#11](https://github.com/PWI-Works/companycam/issues/11)
* Revert "Merge pull request #12 from PWI-Works/improve-oauth-functionality" ([7255f91](https://github.com/PWI-Works/companycam/commit/7255f91)), closes [#12](https://github.com/PWI-Works/companycam/issues/12)
* chore: update releaserc.json to properly support conventional commits ([031d3ec](https://github.com/PWI-Works/companycam/commit/031d3ec))
* docs: clarify usage of openAPI spec locally ([d70ef4e](https://github.com/PWI-Works/companycam/commit/d70ef4e))
* docs: clean up unnecessary comments ([e7fcf64](https://github.com/PWI-Works/companycam/commit/e7fcf64))
* docs: improve example ([ab97985](https://github.com/PWI-Works/companycam/commit/ab97985))
* docs: move pagination example to appropriate section ([3fd0fd3](https://github.com/PWI-Works/companycam/commit/3fd0fd3))
* docs: update docs to note that bsaeURL is no longer required ([6baf724](https://github.com/PWI-Works/companycam/commit/6baf724))
* docs: update terms used ([e3967b7](https://github.com/PWI-Works/companycam/commit/e3967b7))


### BREAKING CHANGE

* deprecate oAuth header builders and replace with api calls

# [1.2.0](https://github.com/PWI-Works/companycam/compare/v1.1.1...v1.2.0) (2025-11-03)


### Features

* implement oAuth endpoints as well ([e62eb3b](https://github.com/PWI-Works/companycam/commit/e62eb3bba968123d694aad11d6565577c140b488))
* move Base client URL into a named constant ([4788440](https://github.com/PWI-Works/companycam/commit/4788440d2e48d66897fcea98aff2766d7514bb9b))

## [1.1.1](https://github.com/PWI-Works/companycam/compare/v1.1.0...v1.1.1) (2025-10-31)


### Bug Fixes

* don't make payload optional for create and update groups ([4269029](https://github.com/PWI-Works/companycam/commit/4269029e095402bfe8272607a2b9afffe1343b5e))
* remove bad import of UserMutable (no longer exported) in tests ([fc28553](https://github.com/PWI-Works/companycam/commit/fc28553e1e6a89e7509bbd218072e0a05d659a00))

# [1.1.0](https://github.com/PWI-Works/companycam/compare/v1.0.3...v1.1.0) (2025-10-30)


### Features

* finalize client side features ([cdd3fbb](https://github.com/PWI-Works/companycam/commit/cdd3fbb2f3f68d7c0ad2063281addb96c0aa0525))

## [1.0.3](https://github.com/PWI-Works/companycam/compare/v1.0.2...v1.0.3) (2025-10-28)


### Bug Fixes

* **package:** fix package name again ([b9dd7e7](https://github.com/PWI-Works/companycam/commit/b9dd7e7f6a0ac2ec5ff35132440641a0dbce416a))

## [1.0.2](https://github.com/PWI-Works/companycam/compare/v1.0.1...v1.0.2) (2025-10-28)


### Bug Fixes

* **package:** update package name ([2638ed9](https://github.com/PWI-Works/companycam/commit/2638ed9060ec3e39b7d73d629c4e793cbfc03e53))

## [1.0.1](https://github.com/PWI-Works/companycam/compare/v1.0.0...v1.0.1) (2025-10-28)


### Bug Fixes

* fix name of package to something we can actually own! ([8233120](https://github.com/PWI-Works/companycam/commit/82331201cae920c629fb881f00357dc53616a6ae))
