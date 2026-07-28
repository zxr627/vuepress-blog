# ECS Auto-Deploy Design

## Goal

Deploy the VuePress blog to the Aliyun ECS automatically whenever `main` is
pushed, without building on the 2 GB server or exposing a root password.

## Delivery Flow

1. GitHub Actions checks out `main`.
2. A GitHub-hosted runner installs locked dependencies with `npm ci`.
3. The runner builds `src/.vuepress/dist` and verifies required public files.
4. The runner uploads one compressed artifact to the ECS over SSH.
5. The ECS deploy script extracts the artifact into a commit-addressed release.
6. The script atomically switches `/var/www/zxroo/current` to the new release.
7. GitHub Actions checks `https://zxroo.top/`.
8. A failed health check switches `current` back to the previous release.

GitHub is not part of the visitor request path. Visitors continue to download
the site directly from the Aliyun ECS through Nginx.

## Server Layout

```text
/var/www/zxroo/
├── current -> releases/<commit-sha>
├── previous -> releases/<previous-commit-sha>
├── incoming/
└── releases/
    └── <commit-sha>/
```

The `deploy` account owns `/var/www/zxroo`. Directories use mode `755` and
regular files use mode `644`. Nginx reads `/var/www/zxroo/current` and does not
need to restart for routine releases.

The initial release is copied from the current `/var/www/zxroo.top` site so the
Nginx root can be changed without downtime.

## GitHub Configuration

The workflow uses a `production` Environment and these encrypted secrets:

- `ECS_HOST`
- `ECS_PORT`
- `ECS_USER`
- `ECS_SSH_PRIVATE_KEY`
- `ECS_KNOWN_HOSTS`

The workflow has `contents: read`, serializes production deployments with a
concurrency group, and supports both `push` to `main` and manual dispatch.

The existing GitHub Pages deployment and generated `CNAME` step are removed.

## Release Safety

- The archive must contain `index.html`, `404.html`, `robots.txt`,
  `sitemap.xml`, and the WeChat administrator verification TXT file.
- An incomplete archive never becomes `current`.
- The previous symlink is retained for immediate rollback.
- Only the latest five release directories are retained.
- A deployment is successful only after the public HTTPS health check passes.

## Security

- GitHub Actions logs in as `deploy`, never `root`.
- The `deploy` account has no password and accepts one dedicated Ed25519 key.
- The workflow stores the private key only in GitHub encrypted secrets.
- The server host key is pinned through `ECS_KNOWN_HOSTS`.
- Existing root SSH settings are not changed by this deployment work.

