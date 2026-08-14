# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Releases are managed with release-please: entries below the Unreleased heading are generated from Conventional Commits.

## [0.2.0](https://github.com/didntchooseaname/lisible/compare/v0.1.0...v0.2.0) (2026-08-14)


### Features

* **a11y:** shared live region announcements ([445a260](https://github.com/didntchooseaname/lisible/commit/445a260d1244d5dcb907aacbfb1a78fe4270b011))
* add a cross variant conformance check ([d55368f](https://github.com/didntchooseaname/lisible/commit/d55368fc9f100437ca399a5a572afe515ff7fe9a))
* add live documentation preview support ([783eb7f](https://github.com/didntchooseaname/lisible/commit/783eb7fc2c4486a977bde6fef5f7d74af95a1b6b))
* add release automation and align the README with the JSON configuration ([d3afac3](https://github.com/didntchooseaname/lisible/commit/d3afac38249226ddc205f3a02e793c282d75f38c))
* add template and degit onboarding paths with non-interactive init ([b3c9516](https://github.com/didntchooseaname/lisible/commit/b3c951615ef5150f703e4736145e26a74685400d))
* add unit tests, Biome linting, drift net and a hardened CI ([b265c9d](https://github.com/didntchooseaname/lisible/commit/b265c9dc39fccf3e2060205124eaa875f280420e))
* align all variants and shared experiences ([143a37a](https://github.com/didntchooseaname/lisible/commit/143a37a9cbb3b0e36bb0b3ae1bf90a54f8c5578a))
* **config:** real newsletter integration ([b984347](https://github.com/didntchooseaname/lisible/commit/b9843472144413ac80f5c42ac1b09e58c34e6a47))
* **content:** richer feeds and llms output ([91ac29e](https://github.com/didntchooseaname/lisible/commit/91ac29eca6b8e3969b60b97658038523bc50d8ec))
* generalize the portfolio pages across every variant ([bbbd498](https://github.com/didntchooseaname/lisible/commit/bbbd4984401ecf1c145e4f5da188c10d800144b7))
* improve interactive diagrams and asset validation ([9b048ee](https://github.com/didntchooseaname/lisible/commit/9b048ee38d566808fecfc86280d1f3f8440968a4))
* make lisible.config.json the single user configuration surface ([cf8c0bd](https://github.com/didntchooseaname/lisible/commit/cf8c0bd10f6dea63e25abd889bd7bda591f00ce6))
* publish the lisible scaffolding CLI ([9aa011d](https://github.com/didntchooseaname/lisible/commit/9aa011dc9514bcc6568aeb51dcee647d2ac17b8c))
* **scripts:** clean-demo command ([a476cef](https://github.com/didntchooseaname/lisible/commit/a476cef70018764cd2fbda6567db3cb063aa194d))
* **scripts:** framework version and doctor ([1b639a8](https://github.com/didntchooseaname/lisible/commit/1b639a8b5d82c8c20ce9e815a02e137b0aca1ac1))
* **scripts:** new-post flags and template ([5ba00df](https://github.com/didntchooseaname/lisible/commit/5ba00df423e3e2a623db9d5a5d59120909bc6731))
* **scripts:** version the drift baseline ([a83bf8e](https://github.com/didntchooseaname/lisible/commit/a83bf8e22874e086cab436da442a1990e9f87a9d))
* **ui:** command palette portfolio entries ([739dff0](https://github.com/didntchooseaname/lisible/commit/739dff0ca1d65ac9eac056828820b83abb109704))
* **ui:** three-state theme toggle ([3ae5dbc](https://github.com/didntchooseaname/lisible/commit/3ae5dbcc1ccf0a6f39d70db0ccc153131da94a9c))
* unify appearance and preview navigation ([1c22ec8](https://github.com/didntchooseaname/lisible/commit/1c22ec8064ca414d7783e15f2dc6dd57e15e25b7))
* unify variant landing experiences ([601c5b3](https://github.com/didntchooseaname/lisible/commit/601c5b3920d701c35bc6029573328235f7c7999e))


### Bug fixes

* **a11y:** complete the search combobox and listbox semantics ([1999837](https://github.com/didntchooseaname/lisible/commit/199983739c6c6dbcec2ae381f01adc4bb987d05a))
* **a11y:** keyboard access to the terminal transcript ([2ea0ac8](https://github.com/didntchooseaname/lisible/commit/2ea0ac88b7f438ba05a3694117743ada5b2a40d5))
* **a11y:** lift low contrast and hidden focus issues in the kits ([3f19d6b](https://github.com/didntchooseaname/lisible/commit/3f19d6bf24ef020d9cc75228c68ca538903b0da8))
* **a11y:** make the image lightbox keyboard operable ([5567575](https://github.com/didntchooseaname/lisible/commit/5567575457f43248620ec533cfea01d57ffa3edf))
* **a11y:** palette semantics and callout titles ([f26c7dc](https://github.com/didntchooseaname/lisible/commit/f26c7dc9a49a83f83f1ce2944a2d775682a43055))
* **a11y:** raise the dark accent contrast floor ([67bc645](https://github.com/didntchooseaname/lisible/commit/67bc645fa5ac2ddb899b8593141d971065133eca))
* **a11y:** render step titles outside the heading outline ([2e1a3f4](https://github.com/didntchooseaname/lisible/commit/2e1a3f407959d2b5582bac630680ff51cfd10736))
* **a11y:** trap focus in the diagram fullscreen fallback ([7f82289](https://github.com/didntchooseaname/lisible/commit/7f82289daa3142b49c56e6dd8e9c012c8065be90))
* **ci:** compute the variant matrix outside the job condition ([d068a75](https://github.com/didntchooseaname/lisible/commit/d068a75820c4a64e6d8cc2f2a68c07da31afa503))
* **ci:** install the workspace for the cli smoke test and surface drift ([4b4e4c6](https://github.com/didntchooseaname/lisible/commit/4b4e4c67a152815be2379b296000f0a3fa7f6d00))
* **ci:** stop comparing Open Graph rasters byte for byte ([3c32259](https://github.com/didntchooseaname/lisible/commit/3c32259f4d41911fffcea4fe4f6b870db1d9591d))
* **config:** stop fabricating social defaults ([21981e7](https://github.com/didntchooseaname/lisible/commit/21981e7440580f4847e8b85be8054404d60738da))
* **deps:** update motion to v13 ([fdd2a13](https://github.com/didntchooseaname/lisible/commit/fdd2a139fda25eed2f4e90d7682fa3d18bb03067))
* **e2e:** move preview ports off the astro default range ([6540434](https://github.com/didntchooseaname/lisible/commit/6540434aed0b66e04b017ee44885989986649b7d))
* hydrate MDX islands again, arm the boot overlay, parameterize deployment ([684c368](https://github.com/didntchooseaname/lisible/commit/684c36854574dc43fdd02d402fd0e3918fde89c3))
* **i18n:** render the file tree in the server locale ([b728341](https://github.com/didntchooseaname/lisible/commit/b728341fdc7dbfdd8562d9491b69802014be425e))
* match long dashes by escape so check-style passes its own scan ([d66bb7a](https://github.com/didntchooseaname/lisible/commit/d66bb7a84c6300a22049c478b6f821559f14509d))
* **mdx:** call the tabs hooks before the disabled early return ([d215e43](https://github.com/didntchooseaname/lisible/commit/d215e439f4431f48b62d1d054fe2f9ea68203c73))
* refine organique landing spacing ([ee2f04d](https://github.com/didntchooseaname/lisible/commit/ee2f04df8d445fedb38e9b4cc382b9bf48834f3d))
* reposition article banners in preview ([67906c5](https://github.com/didntchooseaname/lisible/commit/67906c5f2eddbfe9dcbfc537ba95cdf9bc5819a3))
* **routes:** materialize the shared route stubs as real pages ([5b2df46](https://github.com/didntchooseaname/lisible/commit/5b2df46c3919f05c3de027112343db2774bc13fe))
* **routes:** type the pageless shared routes for astro check ([5b5030b](https://github.com/didntchooseaname/lisible/commit/5b5030bbe25f33347b28ee3b1ff0f21f47ad597b))
* **security:** escape JSON-LD in the script context ([748526f](https://github.com/didntchooseaname/lisible/commit/748526f8058fba8906efed002763e4b78d4651ad))
* ship discussion placeholder styles ([8e8ef65](https://github.com/didntchooseaname/lisible/commit/8e8ef65d231b2b0a491fda34872bbc3d0e211309))
* stop locale navigation request loop ([64706b2](https://github.com/didntchooseaname/lisible/commit/64706b2911cc0b49e08356a29f31f457b4e4a25b))
* **test:** normalize the react island prefixes in the drift check ([b58db2f](https://github.com/didntchooseaname/lisible/commit/b58db2f33afc1455f8c1079e6511ad6e4e49108e))
* **ui:** bundle the toggle state styles globally ([6da5349](https://github.com/didntchooseaname/lisible/commit/6da53491b3a28e340e18cd1882b2897314c5b500))
* validate built HTML links and repair broken tag and series links ([b5683c7](https://github.com/didntchooseaname/lisible/commit/b5683c7ec8cb57a03ce56de9a0d9b9797d8ecccf))
* **variants:** honor the mdxComponents flag ([ea2810f](https://github.com/didntchooseaname/lisible/commit/ea2810fb5994b6b95a4f344b2935ae3ca8a8b0fd))


### Performance

* defer the katex stylesheet ([ae2c56c](https://github.com/didntchooseaname/lisible/commit/ae2c56ce00e35d3892e4d54953dfb805868d2f1b))
* **fonts:** latin subsetting ([d027d6a](https://github.com/didntchooseaname/lisible/commit/d027d6ae37c8fc4c4224f382a79f146e1f67883f))
* inline stylesheets and prioritize covers ([35246d8](https://github.com/didntchooseaname/lisible/commit/35246d81f1400493112b7af641570014ce33e179))


### Refactoring

* **config:** shared tsconfig base ([8e3e46e](https://github.com/didntchooseaname/lisible/commit/8e3e46e476422b650bd2cd48183eae5f11153285))
* first convergence wave of the duplicated modules ([0e94eef](https://github.com/didntchooseaname/lisible/commit/0e94eefc801e02ffdfd247464aee64bb8c7bd847))
* migrate the monorepo to bun workspaces ([01f8a69](https://github.com/didntchooseaname/lisible/commit/01f8a69af528b87259b2aa03d16d8e11791545b7))
* second convergence wave, parameterized shared cores ([9b7a882](https://github.com/didntchooseaname/lisible/commit/9b7a882f98cde6e00f5d2ad4d4f6fdf01b699746))
* share the utils and task checkbox modules through shims ([49cdada](https://github.com/didntchooseaname/lisible/commit/49cdadab61c5b96c841c183af0abe1033c536d79))
* third convergence wave, the high risk modules ([3466067](https://github.com/didntchooseaname/lisible/commit/3466067432805fbee1a13958a6615629fcd3c005))
* unify the shared core across the seven variants ([d4bc768](https://github.com/didntchooseaname/lisible/commit/d4bc768a2dae810a1b12c668337d680c6cb4d9a5))


### Documentation

* contributor workflow and live site link ([b44de04](https://github.com/didntchooseaname/lisible/commit/b44de0454a19eddf94818574b1323909e2c79756))
* link the documentation site from the npm packages ([62469ff](https://github.com/didntchooseaname/lisible/commit/62469ff9497333fffb84611e5f6d4a9142c0970e))
* onboarding and update guides ([7aca109](https://github.com/didntchooseaname/lisible/commit/7aca109301d97e786772a525310d219945eed3e0))


### Maintenance

* add community health files and editorial style check ([589334d](https://github.com/didntchooseaname/lisible/commit/589334d6550efd14956649e8a671aff7eccbe294))
* compress article previews and translate the accent preview name ([b4f7848](https://github.com/didntchooseaname/lisible/commit/b4f78489754e3dbc83ab71080ba1d676ee64893a))
* **deps:** update astro and minor dependencies ([91260d8](https://github.com/didntchooseaname/lisible/commit/91260d8ff45e551aa526c3f6c74172dbab20cc53))
* ignore local Lighthouse and Playwright artifacts ([6bcb24a](https://github.com/didntchooseaname/lisible/commit/6bcb24ab45516791a7bbd3a6d94cd5dc716f5ebd))
* migrate the biome config and drop dead suppressions ([803fee3](https://github.com/didntchooseaname/lisible/commit/803fee3c68dfd9fa65cc8a2324169026e96ef9da))
* repository hygiene ([91cb9b2](https://github.com/didntchooseaname/lisible/commit/91cb9b2927f9c7d39babdaa14c36f2db4aa69cdc))
* scrub personal infrastructure and unify project naming ([1d75b6b](https://github.com/didntchooseaname/lisible/commit/1d75b6b87617a586032fe1aedb7b46e069b23a09))
* **test:** refresh the drift baseline after the a11y changes ([a2ff281](https://github.com/didntchooseaname/lisible/commit/a2ff281bfbb63a05e6a96ec860f2a9f5590b4470))

## [Unreleased]

## [0.1.0]

Initial internal state: six visual variants over one shared core, French and English out of the box, static output with Astro. Never published as a release.
