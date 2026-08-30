const API = "https://api.github.com";

function config() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "Nicky9319";
  const repo = process.env.GITHUB_REPO || "job-hunting-outreach";
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token) throw new Error("GITHUB_TOKEN is not configured");
  return { token, owner, repo, branch };
}

async function github<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = config();
  const response = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init?.headers
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub ${response.status}: ${detail}`);
  }
  return response.json() as Promise<T>;
}

export async function readJson<T>(path: string): Promise<T> {
  const { owner, repo, branch } = config();
  const file = await github<{ content: string; encoding: string }>(
    `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`
  );
  const text = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
  return JSON.parse(text) as T;
}

export async function atomicCommit(
  files: Record<string, unknown>,
  message: string,
  expectedHead?: string
): Promise<string> {
  const { owner, repo, branch } = config();
  const refPath = `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;
  const ref = await github<{ object: { sha: string } }>(refPath);
  const parentSha = ref.object.sha;
  if (expectedHead && parentSha !== expectedHead) throw new Error("CONFLICT");

  const commit = await github<{ tree: { sha: string } }>(
    `/repos/${owner}/${repo}/git/commits/${parentSha}`
  );

  const blobs = await Promise.all(
    Object.entries(files).map(async ([path, value]) => {
      const blob = await github<{ sha: string }>(`/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: JSON.stringify(value, null, 2) + "\n", encoding: "utf-8" })
      });
      return { path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  const tree = await github<{ sha: string }>(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: blobs })
  });

  const next = await github<{ sha: string }>(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] })
  });

  try {
    await github(refPath, {
      method: "PATCH",
      body: JSON.stringify({ sha: next.sha, force: false })
    });
  } catch (error) {
    if (String(error).includes("422")) throw new Error("CONFLICT");
    throw error;
  }
  return next.sha;
}

export async function currentHead(): Promise<string> {
  const { owner, repo, branch } = config();
  const ref = await github<{ object: { sha: string } }>(
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`
  );
  return ref.object.sha;
}
