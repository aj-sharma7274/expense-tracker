# 💰 Expense Tracker

A private, self-hosted expense tracker with a React frontend hosted on **GitHub Pages**, and data stored in a **separate private GitHub repo** via the GitHub API.

- 🔒 PIN-locked — nobody can use it without your PIN  
- 🙈 Private repo — code & data not visible on your profile  
- 📊 Dashboard with charts, budget progress, category breakdown  
- 📅 Monthly budget that auto-refreshes every month  
- ✏️ Editable budgets, deletable transactions  
- 💾 Export / Import JSON backup  
- 🚀 Zero cost, zero third party, 100% yours  

---

## Step 1 — Create the Data Repo (private)

1. Go to GitHub → **New repository**
2. Name it: `expense-tracker-data`
3. Set to **Private**
4. Check ✅ "Add a README file" (so it initializes)
5. Click **Create repository**

Now upload the initial data files:

6. In the repo, click **Add file → Upload files**
7. Create a folder called `data/` and upload:
   - `data/transactions.json`
   - `data/budget.json`

   *(Both files are included in this project under `/data/`)*

---

## Step 2 — Generate a GitHub Personal Access Token (PAT)

1. Go to → https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Give it a name: `expense-tracker`
4. Expiration: **No expiration** (or 1 year)
5. Scopes: check ✅ **repo** (full repo access)
6. Click **Generate token**
7. **Copy the token — you won't see it again!**

---

## Step 3 — Create the Frontend Repo (private)

1. Go to GitHub → **New repository**
2. Name it: `expense-tracker`
3. Set to **Private**
4. Do NOT initialize with README
5. Click **Create repository**

---

## Step 4 — Configure Environment Variables

In this project folder, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
REACT_APP_GITHUB_TOKEN=ghp_your_token_here
REACT_APP_GITHUB_OWNER=your_github_username
REACT_APP_GITHUB_REPO=expense-tracker-data
REACT_APP_PIN=1234
```

> ⚠️ `.env` is in `.gitignore` — it will NEVER be pushed to GitHub.  
> The token and PIN are baked into the build at compile time.

---

## Step 5 — Install & Build

```bash
npm install
npm run build
```

---

## Step 6 — Deploy to GitHub Pages

### First time setup:

Push your source code to the private repo:

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git add .
git commit -m "initial commit"
git push -u origin main
```

Deploy the build to GitHub Pages:

```bash
npm run deploy
```

This runs `gh-pages -d build` which pushes the compiled app to a `gh-pages` branch.

### Enable GitHub Pages:

1. Go to your `expense-tracker` repo on GitHub
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** / root
5. Click **Save**

Your app will be live at:
```
https://YOUR_USERNAME.github.io/expense-tracker/
```

> ✅ The URL is accessible from any browser, any device  
> ✅ Source code is private — not visible on your profile  
> ✅ Data lives in your private `expense-tracker-data` repo  

---

## Updating the App

Whenever you make changes:

```bash
npm run build
npm run deploy
```

That's it. GitHub Pages serves the new build automatically.

---

## Project Structure

```
expense-tracker/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   ├── StatCard.jsx       # Dashboard stat cards
│   │   ├── MonthPicker.jsx    # Month navigator
│   │   └── Loader.jsx         # Loading spinner
│   ├── context/
│   │   └── AppContext.jsx     # Global state (transactions, budget)
│   ├── pages/
│   │   ├── PinLock.jsx        # PIN entry screen
│   │   ├── Dashboard.jsx      # Charts + overview
│   │   ├── AddExpense.jsx     # Expense entry form
│   │   ├── Transactions.jsx   # Transaction list + search + delete
│   │   ├── Budget.jsx         # Monthly budget table (editable)
│   │   └── Settings.jsx       # Sync, export, import
│   ├── utils/
│   │   └── github.js          # All GitHub API read/write logic
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── data/
│   ├── transactions.json      # Upload to expense-tracker-data repo
│   └── budget.json            # Upload to expense-tracker-data repo
├── .env.example               # Copy to .env and fill in
├── .gitignore                 # .env is excluded
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## How Data Flow Works

```
Browser (PIN locked)
      ↓  unlock
  React App
      ↓  read/write via GitHub API
  Private Repo: expense-tracker-data
      ├── data/transactions.json
      └── data/budget.json
```

Every time you add an expense or edit a budget:
- The app calls GitHub API with your PAT
- Reads the current JSON file (gets the SHA)
- Appends / modifies the data
- Writes it back as a new commit

Your transaction history is also your **git commit history** — automatic version control!

---

## FAQ

**Can someone access my data if they have the URL?**  
No. The app is PIN locked. Without the PIN they see only the keypad screen.

**Is my token safe?**  
It's baked into the compiled JS at build time — not in your source code on GitHub. Anyone with the URL + PIN could technically extract it from the JS bundle, so use a strong PIN and keep the URL private (don't share it publicly).

**Can I use it on mobile?**  
Yes — open the GitHub Pages URL in any mobile browser. It's fully responsive.

**What if I change the PIN?**  
Update `REACT_APP_PIN` in `.env`, then `npm run build && npm run deploy`.
