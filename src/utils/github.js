const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const OWNER        = process.env.REACT_APP_GITHUB_OWNER;
const REPO         = process.env.REACT_APP_GITHUB_REPO;
const BASE         = "https://api.github.com";

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
};

// ── helpers ──────────────────────────────────────────────────────
async function getFile(path) {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${path}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const json = await res.json();
  const content = JSON.parse(atob(json.content.replace(/\n/g, "")));
  return { content, sha: json.sha };
}

async function putFile(path, content, sha, message) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    ...(sha && { sha }),
  };
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub write error: ${res.status}`);
  return res.json();
}

// ── Transactions ─────────────────────────────────────────────────
export async function fetchTransactions() {
  const file = await getFile("data/transactions.json");
  if (!file) return [];
  return file.content;
}

export async function saveTransactions(transactions) {
  const file = await getFile("data/transactions.json");
  await putFile(
    "data/transactions.json",
    transactions,
    file?.sha,
    `chore: update transactions ${new Date().toISOString()}`
  );
}

export async function addTransaction(tx) {
  const file = await getFile("data/transactions.json");
  const list = file ? file.content : [];
  const newTx = { ...tx, id: Date.now().toString() };
  const updated = [newTx, ...list];
  await putFile(
    "data/transactions.json",
    updated,
    file?.sha,
    `feat: add expense "${tx.description}" on ${tx.date}`
  );
  return updated;
}

export async function deleteTransaction(id) {
  const file = await getFile("data/transactions.json");
  if (!file) return [];
  const updated = file.content.filter((t) => t.id !== id);
  await putFile(
    "data/transactions.json",
    updated,
    file.sha,
    `feat: delete transaction ${id}`
  );
  return updated;
}

// ── Budget ───────────────────────────────────────────────────────
export async function fetchBudget() {
  const file = await getFile("data/budget.json");
  if (!file) return defaultBudget();
  return file.content;
}

export async function saveBudget(budget) {
  const file = await getFile("data/budget.json");
  await putFile(
    "data/budget.json",
    budget,
    file?.sha,
    `chore: update budget ${new Date().toISOString()}`
  );
}

function defaultBudget() {
  return [
    { category: "Saving & Investment", budget: 10000 },
    { category: "Housing Expense",     budget: 9000  },
    { category: "Term Insurance",      budget: 0     },
    { category: "Health Insurance",    budget: 0     },
    { category: "Transportation",      budget: 1000  },
    { category: "Groceries",           budget: 1500  },
    { category: "Food/Dining Out",     budget: 1000  },
    { category: "Clothing & Accessories", budget: 1000 },
    { category: "Personal care (Grooming)", budget: 500 },
    { category: "Subscription/Recharge",   budget: 500 },
    { category: "Miscellaneous",       budget: 500   },
    { category: "Wants/Dreams",        budget: 1000  },
    { category: "Credit Card Bill",    budget: 3911  },
  ];
}

export { defaultBudget };
