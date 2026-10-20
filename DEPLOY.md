# Publication

## Current state

Approved target: public repository `mizcausevic-dev/thermal-cloak-field-study`, branch `main`, with GitHub Pages built by `.github/workflows/pages.yml`.

Repository: https://github.com/mizcausevic-dev/thermal-cloak-field-study

The repository was already initialized with a README and MIT license before this source upload. Its initial commit is retained as the parent. The complete source is uploaded as a normal fast-forward update; no force push is used. User approval covers source publication, Pages, Dependabot, topics, and protection against branch deletion/force pushes.

Deployment success and live-browser results are recorded separately in `VALIDATION.md`. A build passing by itself does not establish public availability. The product does not need API keys or runtime services.

## Existing repository

Identify the exact repository and target branch first. Inspect its files and Pages configuration. Merge the source and workflow in an isolated branch, preserve unrelated work, run the tests and build, and review the exact patch before any approved push. Do not copy this project over an unrelated repository. Never force-push.

## Reproducing publication from your Windows machine

The following creation sequence is retained for a fresh repository or fork. Do not rerun repository creation against the existing repository. Run these commands only after approving the exact target and extracting the package. Open PowerShell **inside the extracted `thermal-cloak-field-study` directory**. Node/npm, Git, SSH access to GitHub, and your authenticated `gh` are required.

```powershell
npm ci
npm test
npm run build
git init -b main
git add .
git commit -m "Build interactive thermal cloak field study"
gh repo create mizcausevic-dev/thermal-cloak-field-study --public --description "Interactive 34-second scientific schematic of a planar thermal-conduction cloak"
git remote add origin git@github.com:mizcausevic-dev/thermal-cloak-field-study.git
git push -u origin main
gh repo edit mizcausevic-dev/thermal-cloak-field-study --add-topic threejs --add-topic thermal-conduction --add-topic scientific-visualization --add-topic typescript --add-topic vite
gh api --method POST repos/mizcausevic-dev/thermal-cloak-field-study/pages -f build_type=workflow
gh api --method PUT repos/mizcausevic-dev/thermal-cloak-field-study/vulnerability-alerts
```

The MIT license, description, topics, and Dependabot configuration are included. To block force pushes and branch deletion on the main branch after the first push:

```powershell
@'
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
'@ | gh api --method PUT repos/mizcausevic-dev/thermal-cloak-field-study/branches/main/protection --input -
gh workflow run pages.yml --repo mizcausevic-dev/thermal-cloak-field-study
gh run list --repo mizcausevic-dev/thermal-cloak-field-study --workflow pages.yml --limit 3
```

Use the actual run ID from the list:

```powershell
gh run watch RUN_ID --repo mizcausevic-dev/thermal-cloak-field-study
gh api repos/mizcausevic-dev/thermal-cloak-field-study/pages --jq .html_url
```

Replace `RUN_ID` with that returned run's numeric ID; do not enter the word literally. Open the **returned** Pages URL. Check Play, scrub to 7.5/21/29/34 seconds, pause/resume, replay, mute, layers, keyboard focus, and mobile layout. A successful build is not proof of deployment; a successful deployment is not proof that the public page was browser-tested. If any command errors, resolve that error before claiming the corresponding step succeeded. If Pages already exists, inspect it instead of repeating the POST.

## Static upload alternative

Upload every file **inside `dist/`** to the target site's document root, preserving `assets/`. The entry point is `index.html`. Relative Vite paths support a GitHub Pages project subpath. There are no remote scripts, runtime API services, or secrets. A standard HTTPS static server is sufficient.

For a one-file handoff, upload or open `thermal-cloak.html`. Its dependencies and fonts are embedded. This is also useful for offline review.
