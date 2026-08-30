#!/usr/bin/env node
/**
 * ElseSourav GitHub Repository Collector & Review Pack Generator
 *
 * Requirements:
 *   - Node.js 18+
 *   - GitHub CLI (gh) OR direct GitHub API (automatically uses macOS keychain token if available)
 *   - git
 *
 * Usage:
 *   node collect-repos.mjs
 *   node collect-repos.mjs --owner elsesourav --limit 200
 *   node collect-repos.mjs --owner elsesourav --include-forks
 *   node collect-repos.mjs --no-clone
 *
 * Output:
 *   elsesourav-repo-review/
 *     repositories.json
 *     repositories.md
 *     repos/<repo-name>/
 *     analysis/<repo-name>.md
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const owner = getArg("--owner", "elsesourav");
const limit = Number(getArg("--limit", "200"));
const includeForks = has("--include-forks");
const noClone = has("--no-clone");
const output = path.resolve(getArg("--output", "elsesourav-repo-review"));

const run = (command, commandArgs, options = {}) =>
  new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
      GIT_TERMINAL_PROMPT: "0",
      ...(options.env || {}),
    };

    const child = spawn(command, commandArgs, {
      cwd: options.cwd,
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} ${commandArgs.join(" ")} failed (${code})\n${stderr}`));
    });

    if (options.timeoutMs) {
      setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error(`${command} timed out after ${options.timeoutMs}ms`));
      }, options.timeoutMs);
    }
  });

const getKeychainToken = async () => {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const out = await run("git", ["credential-osxkeychain", "get"], {
      env: { GIT_TERMINAL_PROMPT: "0" },
    }).catch(async () => {
      const child = spawn("/bin/sh", ["-c", 'printf "protocol=https\\nhost=github.com\\n\\n" | git credential-osxkeychain get']);
      let res = "";
      child.stdout.on("data", (d) => (res += d));
      await new Promise((r) => child.on("close", r));
      return res;
    });
    const match = String(out).match(/^password=(.+)$/m);
    if (match && match[1]) return match[1].trim();
  } catch {}
  return null;
};

const safeRead = async (file) => {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
};

const exists = async (file) => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

const walk = async (dir, maxFiles = 5000) => {
  const result = [];
  const ignored = new Set([
    ".git", "node_modules", ".next", "dist", "build", "coverage",
    ".turbo", ".cache", "vendor", "target", "__pycache__", ".venv"
  ]);

  async function visit(current) {
    if (result.length >= maxFiles) return;
    let entries = [];
    try { entries = await fs.readdir(current, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      if (result.length >= maxFiles) return;
      if (ignored.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(full);
      else result.push(path.relative(dir, full));
    }
  }
  await visit(dir);
  return result;
};

const summarizeRepo = async (repo, repoDir) => {
  const files = repoDir ? await walk(repoDir) : [];
  const lower = new Set(files.map((f) => f.toLowerCase()));
  const readmeName = files.find((f) => /^readme(\.md|\.txt|)$/i.test(path.basename(f)));
  const readme = readmeName && repoDir ? await safeRead(path.join(repoDir, readmeName)) : null;

  let packageJson = null;
  if (repoDir && lower.has("package.json")) {
    try { packageJson = JSON.parse(await fs.readFile(path.join(repoDir, "package.json"), "utf8")); }
    catch {}
  }

  const frameworkHints = [];
  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };
  for (const name of ["next", "react", "typescript", "express", "vite", "electron",
    "three", "tensorflow", "tensorflow.js", "@supabase/supabase-js", "prisma",
    "@prisma/client", "tailwindcss", "playwright", "vitest", "jest"]) {
    if (deps[name]) frameworkHints.push(`${name}@${deps[name]}`);
  }

  const topLevel = [...new Set(files.map((f) => f.split(path.sep)[0]))]
    .filter(Boolean).slice(0, 80);

  return {
    name: repo.name,
    url: repo.url,
    description: repo.description ?? "",
    visibility: repo.visibility,
    isFork: repo.isFork,
    isArchived: repo.isArchived,
    primaryLanguage: repo.primaryLanguage?.name ?? (typeof repo.primaryLanguage === "string" ? repo.primaryLanguage : null),
    languages: repo.languages ?? [],
    stars: repo.stargazerCount ?? 0,
    forks: repo.forkCount ?? 0,
    license: repo.licenseInfo?.spdxId ?? null,
    createdAt: repo.createdAt,
    updatedAt: repo.pushedAt,
    defaultBranch: repo.defaultBranchRef?.name ?? null,
    homepage: repo.homepageUrl ?? null,
    topics: repo.repositoryTopics ?? [],
    fileCount: files.length,
    topLevel,
    readmePath: readmeName ?? null,
    readmeChars: readme?.length ?? 0,
    packageName: packageJson?.name ?? null,
    packageDescription: packageJson?.description ?? null,
    frameworkHints,
  };
};

const mdEscape = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

await fs.mkdir(output, { recursive: true });
await fs.mkdir(path.join(output, "analysis"), { recursive: true });
if (!noClone) await fs.mkdir(path.join(output, "repos"), { recursive: true });

const token = await getKeychainToken();
if (token) {
  process.env.GITHUB_TOKEN = token;
  console.log("✓ GitHub authorization token detected from system keychain.");
}

console.log(`Fetching repositories for ${owner}...`);

const jsonFields = [
  "name","nameWithOwner","description","url","visibility","isFork","isArchived",
  "primaryLanguage","languages","stargazerCount","forkCount","licenseInfo",
  "createdAt","pushedAt","defaultBranchRef","homepageUrl","repositoryTopics"
].join(",");

const listArgs = ["repo", "list", owner, "--limit", String(limit), "--json", jsonFields];
if (!includeForks) listArgs.push("--source");

let repos;
try {
  const ghOutput = await run("gh", listArgs, {
    env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN },
  });
  repos = JSON.parse(ghOutput);
  console.log(`✓ Fetched via GitHub CLI.`);
} catch (err) {
  console.warn("Could not query gh CLI directly. Fetching via GitHub API...");
  try {
    const fetched = [];
    let page = 1;
    while (fetched.length < limit) {
      const perPage = Math.min(100, limit - fetched.length);
      const headers = { "User-Agent": "ElseSourav-Review-Tool" };
      if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }
      const res = await fetch(`https://api.github.com/users/${owner}/repos?per_page=${perPage}&page=${page}&sort=pushed`, { headers });
      if (!res.ok) {
        throw new Error(`GitHub API HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const item of data) {
        if (!includeForks && item.fork) continue;
        fetched.push({
          name: item.name,
          nameWithOwner: item.full_name,
          description: item.description ?? "",
          url: item.html_url,
          visibility: item.private ? "PRIVATE" : "PUBLIC",
          isFork: item.fork,
          isArchived: item.archived,
          primaryLanguage: item.language ? { name: item.language } : null,
          languages: item.language ? [{ name: item.language, size: 0 }] : [],
          stargazerCount: item.stargazers_count ?? 0,
          forkCount: item.forks_count ?? 0,
          licenseInfo: item.license ? { spdxId: item.license.spdx_id || item.license.name } : null,
          createdAt: item.created_at,
          pushedAt: item.pushed_at,
          defaultBranchRef: item.default_branch ? { name: item.default_branch } : null,
          homepageUrl: item.homepage,
          repositoryTopics: item.topics ?? [],
        });
      }
      if (data.length < perPage) break;
      page++;
    }
    repos = fetched;
  } catch (apiErr) {
    console.error("\nCould not fetch repositories via GitHub CLI or API.");
    console.error(apiErr.message);
    process.exit(1);
  }
}

console.log(`Found ${repos.length} repositories.`);

const summaries = [];

for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  console.log(`[${i + 1}/${repos.length}] ${repo.name}`);

  let repoDir = null;

  if (!noClone) {
    repoDir = path.join(output, "repos", repo.name);
    if (!(await exists(repoDir))) {
      try {
        const cloneUrl = token
          ? `https://${token}@github.com/${repo.nameWithOwner || `${owner}/${repo.name}`}.git`
          : repo.url;
        await run("git", ["clone", "--depth", "1", cloneUrl, repoDir], { timeoutMs: 60000 });
      } catch (err) {
        console.warn(`  Clone failed: ${err.message.split("\n")[0]}`);
        repoDir = null;
      }
    } else {
      console.log("  Already cloned; analyzing existing copy.");
    }
  }

  const summary = await summarizeRepo(repo, repoDir);
  summaries.push(summary);

  const languagesFormatted = Array.isArray(summary.languages) && summary.languages.length
    ? summary.languages.map(x => typeof x === "object" && x.name ? `${x.name}${x.size ? ` (${x.size})` : ""}` : String(x)).join(", ")
    : "Not available";

  const report = [
    `# ${summary.name}`,
    "",
    `**Repository:** ${summary.url}`,
    `**Description:** ${summary.description || "No description"}`,
    "",
    "## Repository metadata",
    "",
    `- Primary language: ${summary.primaryLanguage || "Unknown"}`,
    `- Languages: ${languagesFormatted}`,
    `- Stars: ${summary.stars}`,
    `- Forks: ${summary.forks}`,
    `- License: ${summary.license || "Not specified"}`,
    `- Archived: ${summary.isArchived ? "Yes" : "No"}`,
    `- Fork: ${summary.isFork ? "Yes" : "No"}`,
    `- Last pushed: ${summary.updatedAt || "Unknown"}`,
    `- Topics: ${summary.topics.join(", ") || "None"}`,
    "",
    "## Detected stack",
    "",
    summary.frameworkHints.length
      ? summary.frameworkHints.map(x => `- ${x}`).join("\n")
      : "- No package-based stack hints detected.",
    "",
    "## Repository structure",
    "",
    `Approximate file count (excluding common build/vendor directories): ${summary.fileCount}`,
    "",
    summary.topLevel.length ? summary.topLevel.map(x => `- ${x}`).join("\n") : "- Not cloned/analyzed.",
    "",
    "## Review checklist",
    "",
    "- Purpose / problem solved",
    "- Architecture and code organization",
    "- Engineering depth",
    "- UX / product quality",
    "- Documentation / README quality",
    "- Testing",
    "- Security",
    "- Maintainability",
    "- Deployment readiness",
    "- What should be highlighted on ElseSourav",
    "- What should be archived or de-emphasized",
    "",
    "> This file is an evidence pack generated from repository metadata and local structure. It does not claim code quality without inspection.",
    ""
  ].join("\n");

  await fs.writeFile(path.join(output, "analysis", `${repo.name}.md`), report);
}

await fs.writeFile(
  path.join(output, "repositories.json"),
  JSON.stringify(summaries, null, 2)
);

const table = [
  "# ElseSourav GitHub Repository Inventory",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Owner: **${owner}**`,
  "",
  `Repositories collected: **${summaries.length}**`,
  "",
  "| # | Repository | Language | Description | Updated | Stars | Forks |",
  "|---:|---|---|---|---|---:|---:|",
  ...summaries.map((r, i) =>
    `| ${i + 1} | [${mdEscape(r.name)}](${r.url}) | ${mdEscape(r.primaryLanguage || "—")} | ${mdEscape(r.description || "—")} | ${r.updatedAt ? r.updatedAt.slice(0,10) : "—"} | ${r.stars} | ${r.forks} |`
  ),
  "",
  "## How to use this pack",
  "",
  "Review `repositories.json` for machine-readable metadata.",
  "Review `analysis/<repo>.md` for each repository's inspection checklist.",
  "If repositories were cloned, inspect the source under `repos/<repo>`.",
  "",
  "For a deeper engineering review, the next step is to read each cloned repository's README, package manifests, source structure, tests, CI, and security configuration."
].join("\n");

await fs.writeFile(path.join(output, "repositories.md"), table);

console.log("\nDone.");
console.log(`Output: ${output}`);
console.log(`Repositories: ${summaries.length}`);
console.log("Share the generated folder/zip with ChatGPT for the repo-by-repo review.");
