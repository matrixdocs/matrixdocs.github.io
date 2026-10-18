# Matrix Docs

Source for [matrixdocs.github.io](https://matrixdocs.github.io/), an independent, unofficial guide to the [Matrix](https://matrix.org) protocol and its ecosystem. It is not affiliated with the Matrix.org Foundation or Element.

The site was first drafted with AI in January 2026 and is now being verified against pinned upstream sources (Matrix spec v1.19, Synapse v1.163.0). See [docs/about.md](docs/about.md).

## Build

```bash
npm ci
npm run build   # fails on broken internal links and anchors
npm start       # local preview
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Contributing

Corrections are welcome. Cite the source (spec section, upstream file and line, or release notes) in the PR.
