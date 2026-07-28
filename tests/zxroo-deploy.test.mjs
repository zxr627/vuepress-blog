import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const bash =
  process.platform === "win32" ? "D:\\Zxr\\Git\\bin\\bash.exe" : "bash";
const deployScript = path.join(repoRoot, "scripts", "zxroo-deploy.sh");
const requiredFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "0752e0217f4f06edf6c758d09659d6da.txt",
];

const createArchive = (root, sha, files = requiredFiles) => {
  const source = path.join(root, `source-${sha}`);
  const archive = path.join(root, `${sha}.tar.gz`);
  mkdirSync(source, { recursive: true });

  for (const file of files) {
    writeFileSync(path.join(source, file), `${sha}:${file}\n`);
  }

  execFileSync("tar", ["-czf", archive, "-C", source, "."], {
    stdio: "pipe",
  });

  return archive;
};

const toBashPath = (value) => {
  if (process.platform !== "win32") return value;

  return execFileSync(bash, ["-lc", 'cygpath -u "$1"', "--", value], {
    encoding: "utf8",
  }).trim();
};

const runDeploy = (deployRoot, ...args) =>
  execFileSync(
    bash,
    [
      toBashPath(deployScript),
      ...args.map((value) =>
        path.isAbsolute(value) ? toBashPath(value) : value,
      ),
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        ZXROO_DEPLOY_ROOT: toBashPath(deployRoot),
      },
      encoding: "utf8",
      stdio: "pipe",
    },
  );

test("rejects an incomplete release archive", () => {
  const root = mkdtempSync(path.join(tmpdir(), "zxroo-deploy-"));
  const archive = createArchive(root, "bad-release", ["404.html"]);

  assert.throws(
    () => runDeploy(root, "activate", "bad-release", archive),
    /missing required file: index\.html/,
  );
});

test(
  "activates releases atomically and rolls back to the previous release",
  { skip: process.platform === "win32" && "requires Linux symlinks" },
  () => {
    const root = mkdtempSync(path.join(tmpdir(), "zxroo-deploy-"));
    const firstArchive = createArchive(root, "release-one");
    const secondArchive = createArchive(root, "release-two");

    runDeploy(root, "activate", "release-one", firstArchive);
    assert.equal(
      path.basename(readlinkSync(path.join(root, "current"))),
      "release-one",
    );

    runDeploy(root, "activate", "release-two", secondArchive);
    assert.equal(
      path.basename(readlinkSync(path.join(root, "current"))),
      "release-two",
    );
    assert.equal(
      path.basename(readlinkSync(path.join(root, "previous"))),
      "release-one",
    );

    runDeploy(root, "rollback");
    assert.equal(
      path.basename(readlinkSync(path.join(root, "current"))),
      "release-one",
    );
  },
);

test(
  "removes a successfully activated archive from the incoming directory",
  { skip: process.platform === "win32" && "requires Linux symlinks" },
  () => {
    const root = mkdtempSync(path.join(tmpdir(), "zxroo-deploy-"));
    const incoming = path.join(root, "incoming");
    const archive = createArchive(incoming, "release-one");

    runDeploy(root, "activate", "release-one", archive);

    assert.equal(existsSync(archive), false);
  },
);

test(
  "keeps only the five newest releases",
  { skip: process.platform === "win32" && "requires Linux symlinks" },
  () => {
    const root = mkdtempSync(path.join(tmpdir(), "zxroo-deploy-"));

    for (let index = 1; index <= 7; index += 1) {
      const sha = `release-${index}`;
      runDeploy(root, "activate", sha, createArchive(root, sha));
    }

    const releases = execFileSync(
      bash,
      [
        "-lc",
        `find '${path.join(root, "releases").replaceAll("\\", "/")}' -mindepth 1 -maxdepth 1 -type d | wc -l`,
      ],
      { encoding: "utf8" },
    ).trim();

    assert.equal(releases, "5");
  },
);

test("workflow builds once and deploys the verified artifact to ECS", () => {
  const workflow = readFileSync(
    path.join(repoRoot, ".github", "workflows", "deploy.yml"),
    "utf8",
  );

  for (const required of [
    "workflow_dispatch:",
    "permissions:",
    "contents: read",
    "concurrency:",
    "environment: production",
    "npm ci",
    "actions/upload-artifact@v4",
    "actions/download-artifact@v4",
    "secrets.ECS_HOST",
    "secrets.ECS_PORT",
    "secrets.ECS_USER",
    "secrets.ECS_SSH_PRIVATE_KEY",
    "secrets.ECS_KNOWN_HOSTS",
    "zxroo-deploy activate",
    "zxroo-deploy rollback",
    "https://zxroo.top/",
  ]) {
    assert.match(workflow, new RegExp(required.replaceAll(".", "\\.")));
  }

  assert.doesNotMatch(workflow, /actions-gh-pages|peaceiris|CNAME/);
});
