import "server-only";

import { MockDB, createEmptyMockDb } from "@/api/mockDbSchema";

const GITHUB_API = "https://api.github.com";
const OWNER = process.env.MOCK_DB_GITHUB_OWNER || "PitiMonster";
const REPO = process.env.MOCK_DB_GITHUB_REPO || "BNSStore";
const BRANCH = process.env.MOCK_DB_GITHUB_BRANCH || "main";
const FILE_PATH = process.env.MOCK_DB_GITHUB_PATH || "mock-db.json";
const MAX_RETRIES = 7;
const RETRY_BASE_MS = 150;

type GitHubContentResponse = {
  sha: string;
  content: string;
  encoding: "base64";
};

const assertConfig = () => {
  const token = process.env.GH_PAT_TO_SAVE_DB;
  if (!token) {
    throw new Error("Missing GH_PAT_TO_SAVE_DB environment variable.");
  }
  return token;
};

const getFileUrl = () =>
  `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
});

const decodeBase64Json = (base64: string): MockDB => {
  const normalized = base64.replace(/\n/g, "");
  const decoded = Buffer.from(normalized, "base64").toString("utf-8");
  return JSON.parse(decoded) as MockDB;
};

const encodeJsonBase64 = (db: MockDB): string => {
  return Buffer.from(JSON.stringify(db, null, 2), "utf-8").toString("base64");
};

const getCurrentFile = async (
  token: string,
): Promise<{ sha?: string; db: MockDB }> => {
  const res = await fetch(getFileUrl(), {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (res.status === 404) {
    return { db: createEmptyMockDb() };
  }

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 403) {
      throw new Error(
        `GitHub DB read failed (403). Token cannot read repository contents for ${OWNER}/${REPO}/${FILE_PATH} on branch ${BRANCH}. Ensure GH_PAT_TO_SAVE_DB has repository contents access. Raw: ${text}`,
      );
    }
    if (res.status === 404) {
      throw new Error(
        `GitHub DB read failed (404). Check repository access and target path: ${OWNER}/${REPO}/${FILE_PATH} on branch ${BRANCH}. Raw: ${text}`,
      );
    }
    throw new Error(`GitHub DB read failed (${res.status}): ${text}`);
  }

  const payload = (await res.json()) as GitHubContentResponse;
  if (!payload?.content || payload.encoding !== "base64") {
    throw new Error("GitHub DB response has invalid content format.");
  }

  return {
    sha: payload.sha,
    db: decodeBase64Json(payload.content),
  };
};

const putFile = async (
  token: string,
  db: MockDB,
  message: string,
  sha?: string,
) => {
  const res = await fetch(
    `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify({
        message,
        content: encodeJsonBase64(db),
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    },
  );

  if (res.ok) {
    return;
  }

  if (res.status === 409 || res.status === 422) {
    throw new Error("GITHUB_SHA_CONFLICT");
  }

  const text = await res.text();
  if (res.status === 403) {
    throw new Error(
      `GitHub DB write failed (403). Token cannot write repository contents for ${OWNER}/${REPO}/${FILE_PATH} on branch ${BRANCH}. Ensure GH_PAT_TO_SAVE_DB has contents:write access. Raw: ${text}`,
    );
  }
  if (res.status === 404) {
    throw new Error(
      `GitHub DB write failed (404). Check repository access and target path: ${OWNER}/${REPO}/${FILE_PATH} on branch ${BRANCH}. Raw: ${text}`,
    );
  }
  throw new Error(`GitHub DB write failed (${res.status}): ${text}`);
};

export const readMockDb = async (): Promise<MockDB> => {
  const token = assertConfig();
  const { db, sha } = await getCurrentFile(token);

  if (!sha) {
    // File doesn't exist yet — try to create it. If a concurrent caller beats
    // us to it (409/422) we silently ignore the conflict; the DB is now
    // initialized and the caller can proceed with the empty state it received.
    try {
      await putFile(token, db, "mock-db: initialize shared db");
    } catch (e) {
      if (!(e instanceof Error && e.message === "GITHUB_SHA_CONFLICT")) {
        throw e;
      }
    }
  }

  return db;
};

export const updateMockDb = async (
  mutate: (db: MockDB) => { db: MockDB; update: boolean },
  commitMessage: string,
): Promise<MockDB> => {
  const token = assertConfig();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const { db: currentDb, sha } = await getCurrentFile(token);
      const cloned = JSON.parse(JSON.stringify(currentDb)) as MockDB;
      const nextDb = mutate(cloned);
      if (!nextDb.update) {
        return nextDb.db;
      }
      await putFile(token, nextDb.db, commitMessage, sha);
      return nextDb.db;
    } catch (error) {
      if (error instanceof Error && error.message === "GITHUB_SHA_CONFLICT") {
        lastError = error;
        // Exponential back-off with full jitter so concurrent callers don't
        // all retry at the same instant and collide again immediately.
        const ceiling = RETRY_BASE_MS * Math.pow(2, attempt - 1);
        const delay = Math.random() * ceiling;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `GitHub DB write failed after ${MAX_RETRIES} retries due to SHA conflicts.${
      lastError ? ` Last error: ${lastError.message}` : ""
    }`,
  );
};
