import fs from "fs";
import path from "path";

const token = process.env.GH_TOKEN;
if (!token) { console.error("GH_TOKEN env var required"); process.exit(1); }

const owner = "DEVOMO12";
const repo = "NovaChat";
const dir = "C:\\Users\\Admin\\Downloads\\Nova-Connect\\Nova-Connect";

const excludeDirs = new Set(["node_modules", ".git", ".expo", ".local", ".cache", ".agents", ".canvas", "attached_assets"]);
const excludeFiles = new Set([".env"]);
const includeDotFiles = new Set([".gitignore", ".replit", ".replitignore", ".npmrc"]);

async function api(method, pathSuffix, body) {
  const res = await fetch(`https://api.github.com${pathSuffix}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`API ${res.status}: ${data.message}`);
  return data;
}

async function main() {
  const files = [];
  function walk(p) {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, e.name);
      const rel = path.relative(dir, full).replace(/\\/g, "/");
      if (e.isDirectory()) {
        if (!excludeDirs.has(e.name) && !e.name.startsWith(".")) walk(full);
      } else {
        if (excludeFiles.has(e.name)) continue;
        if (e.name.startsWith(".") && !includeDotFiles.has(e.name)) continue;
        files.push(rel);
      }
    }
  }
  walk(dir);

  const latestCommit = await api("GET", `/repos/${owner}/${repo}/git/ref/heads/main`);
  const baseTreeSha = (await api("GET", `/repos/${owner}/${repo}/git/commits/${latestCommit.object.sha}`)).tree.sha;

  const treeEntries = [];
  for (let i = 0; i < files.length; i++) {
    const content = fs.readFileSync(path.join(dir, files[i]));
    const blob = await api("POST", `/repos/${owner}/${repo}/git/blobs`, { content: content.toString("base64"), encoding: "base64" });
    treeEntries.push({ path: files[i], mode: "100644", type: "blob", sha: blob.sha });
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${files.length}`);
  }

  const newTree = await api("POST", `/repos/${owner}/${repo}/git/trees`, { base_tree: baseTreeSha, tree: treeEntries });
  const newCommit = await api("POST", `/repos/${owner}/${repo}/git/commits`, {
    message: "Deploy NovaChat backend to Render",
    tree: newTree.sha,
    parents: [latestCommit.object.sha],
  });

  await api("PATCH", `/repos/${owner}/${repo}/git/refs/heads/main`, { sha: newCommit.sha, force: true });
  console.log("Push to main successful!");
}

main().catch((e) => { console.error("Failed:", e.message); process.exit(1); });
