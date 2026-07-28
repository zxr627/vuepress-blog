# ECS Auto-Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically build the VuePress site on GitHub and atomically deploy it to the Aliyun ECS after every push to `main`.

**Architecture:** GitHub Actions produces one verified static artifact. A dedicated ECS account accepts the artifact and runs a small release switcher that updates an Nginx-facing symlink and supports rollback.

**Tech Stack:** VuePress 2, npm, GitHub Actions, OpenSSH, POSIX shell, tar, Nginx

## Global Constraints

- Never place a root password in the repository or GitHub Secrets.
- Build on GitHub-hosted runners, not on the 2 GB ECS.
- Preserve the current public site during the initial migration.
- Keep user-authored working tree changes outside the deployment patch untouched.

---

### Task 1: Release Switcher

**Files:**
- Create: `scripts/zxroo-deploy.sh`
- Test: `tests/zxroo-deploy.test.mjs`

**Interfaces:**
- Consumes: `activate <sha> <archive-path>` or `rollback`
- Produces: `/var/www/zxroo/current` and `/var/www/zxroo/previous` symlinks

- [ ] **Step 1: Write a failing filesystem test**

Create temporary `incoming`, `releases`, and `current` paths. Assert that
`activate` rejects an archive without `index.html`, switches a complete
release, retains the previous target, and keeps at most five releases.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/zxroo-deploy.test.mjs
```

Expected: FAIL because `scripts/zxroo-deploy.sh` does not exist.

- [ ] **Step 3: Implement the minimal release switcher**

The script accepts `ZXROO_DEPLOY_ROOT` for tests and defaults to
`/var/www/zxroo`. It validates the SHA, extracts into a temporary directory,
checks required files, applies `755/644` permissions, atomically moves the
release and symlink, and implements `rollback`.

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
node --test tests/zxroo-deploy.test.mjs
```

Expected: all release-switching tests pass.

### Task 2: ECS Deployment Account and Nginx Migration

**Files:**
- Install: `/usr/local/bin/zxroo-deploy`
- Modify: `/etc/nginx/conf.d/zxroo.top.conf`

**Interfaces:**
- Consumes: the release switcher from Task 1 and the generated deploy public key
- Produces: SSH account `deploy` and Nginx root `/var/www/zxroo/current`

- [ ] **Step 1: Generate a dedicated Ed25519 key**

Run locally:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/zxroo_github_deploy -N "" -C github-actions-zxroo
```

- [ ] **Step 2: Create the server account and release root**

Create a locked-password `deploy` account, install only the generated public
key, create `/var/www/zxroo/{incoming,releases}`, and copy the current site into
an `initial` release.

- [ ] **Step 3: Install and smoke-test the switcher**

Install the repository script as `/usr/local/bin/zxroo-deploy`, owned by root
and executable by all users. Run `activate initial` against a test archive and
then restore the initial release.

- [ ] **Step 4: Migrate Nginx**

Change both HTTP and HTTPS roots from `/var/www/zxroo.top` to
`/var/www/zxroo/current`, then run:

```bash
nginx -t
systemctl reload nginx
curl -fsS https://zxroo.top/ >/dev/null
```

Expected: all three commands succeed and the site remains available.

### Task 3: GitHub Actions Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: npm lockfile, GitHub production secrets, ECS release switcher
- Produces: one serialized production deployment per `main` push

- [ ] **Step 1: Add a static workflow contract test**

Extend the Node test suite to assert that the workflow uses `npm ci`, uploads
the build artifact, references all five ECS secrets, deploys through
`zxroo-deploy`, performs HTTPS health checking, and does not reference
`actions-gh-pages` or generate `CNAME`.

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
node --test tests/zxroo-deploy.test.mjs
```

Expected: FAIL against the current GitHub Pages workflow.

- [ ] **Step 3: Replace the deployment workflow**

Implement separate `build` and `deploy` jobs, `contents: read`, production
environment secrets, deployment concurrency, artifact transfer, activation,
public health check, and rollback on failure.

- [ ] **Step 4: Run the contract test and verify GREEN**

Run:

```bash
node --test tests/zxroo-deploy.test.mjs
```

Expected: all workflow and release tests pass.

### Task 4: GitHub Environment and End-to-End Verification

**Files:**
- No repository files

**Interfaces:**
- Consumes: the dedicated private key and verified ECS host key
- Produces: configured GitHub `production` Environment

- [ ] **Step 1: Add the five encrypted secrets**

Use the GitHub repository settings page to create the `production` Environment
and add `ECS_HOST`, `ECS_PORT`, `ECS_USER`, `ECS_SSH_PRIVATE_KEY`, and
`ECS_KNOWN_HOSTS`.

- [ ] **Step 2: Run a clean local build**

Run:

```bash
npm ci
npm run docs:build
```

Expected: VuePress renders the complete site and all required files exist.

- [ ] **Step 3: Trigger a manual deployment**

Run the workflow through `workflow_dispatch`. Confirm the build and deploy jobs
both succeed and `current` points to the workflow commit SHA.

- [ ] **Step 4: Verify the public site and rollback path**

Check the home page, a direct article URL, the WeChat TXT file, and HTTPS.
Run one controlled `rollback`, verify the previous release, then reactivate the
new release.

