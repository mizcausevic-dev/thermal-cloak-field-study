# Publication

## Current deployment

- Live study: https://mizcausevic-dev.github.io/thermal-cloak-field-study/
- Public source: https://github.com/mizcausevic-dev/thermal-cloak-field-study
- Branch: `main`
- Pages source: **GitHub Actions**, using `.github/workflows/pages.yml`
- Initial successful deployment: [run 39467954148, attempt 2](https://github.com/mizcausevic-dev/thermal-cloak-field-study/actions/runs/39467954148)

The original repository README/license commit was preserved as the parent of the source upload. Normal fast-forward updates were used. The repository has an MIT license, description, live homepage, five topics, Dependabot alerts/security updates, and scheduled npm/GitHub Actions version updates. The active **Protect main** ruleset blocks force pushes and branch deletion with no bypass actors.

The public HTML and its JavaScript, stylesheet, favicon, and bundled fonts returned HTTP 200 and matched the tested production build. Public-page browser automation did not complete. See [VALIDATION.md](VALIDATION.md) for the checks and remaining rendering limits.

## Update the existing site

Use Node.js 22.12+ or 24. Clone the existing repository, make changes, and run:

```sh
npm ci
npm test
npm run build
```

Review and commit the intended changes, then push a normal fast-forward update or merge a pull request into `main`. The workflow tests and builds the source, uploads `dist/` with `upload-pages-artifact`, and deploys it with `deploy-pages`. It can also be started manually from Actions. Never force-push or recreate this repository to update the site.

Wait for both the build and deploy jobs to succeed. Open the actual environment URL from the deployment. Check play/pause, seeking to 7.5/21/29/34 seconds, replay, mute, layers, keyboard focus, and mobile layout. Inspect native WebGL rendering in a capable browser. A successful build alone does not establish deployment or browser behavior.

The first deployment failed because Pages was not yet enabled. For a fork or new repository, select **Settings → Pages → Source → GitHub Actions** before deploying. Do not repeat repository or Pages creation against the existing project.

## Static upload alternative

Upload every file **inside `dist/`** to the target site's document root, preserving `assets/`. The entry point is `index.html`. Relative Vite paths support a GitHub Pages project subpath. There are no remote scripts, runtime API services, accounts, or secrets. A standard HTTPS static server is sufficient.

For a one-file handoff, run `npm run package:html` and open or upload `standalone/thermal-cloak.html`. Its scripts, styles, fonts, favicon, and license notices are embedded.
