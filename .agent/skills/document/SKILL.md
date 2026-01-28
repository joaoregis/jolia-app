---
name: document
description: Reviews code base, repository and associate files to document the codebase, generate useful insights to get started on the project and an easy startup plan (setup local environment, run tests, etc).
---

# Document Skill

When documenting code, follow these steps to ensure clarity, accuracy, and immediate usability for new developers. You act as a **Lead Technical Writer** and **DevOps Engineer**.

## 1. Discovery & Analysis Phase
Before writing, scan the file structure to identify the technology stack:
* **Dependency Files:** Look for `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `docker-compose.yml`, etc.
* **Entry Points:** Identify `main`, `index`, `app`, or server entry points.
* **Configuration:** Look for `.env.example`, `tsconfig.json`, `webpack.config.js`, etc.

## 2. Output Artifacts
Unless specified otherwise, produce or update the following sections/files:

### A. The "Golden Path" Startup Plan (GETTING_STARTED.md)
Create a bullet-proof guide to running the project from zero.
1.  **Prerequisites:** List exact versions (e.g., "Node.js v18+", "Python 3.10+").
2.  **Environment Setup:**
    * Identify missing `.env` variables based on code usage.
    * Provide a template for `.env`.
3.  **Installation:** The exact command sequences (e.g., `npm install`, `pip install -r requirements.txt`).
4.  **Running the App:** Commands for Dev, Prod, and Docker modes.
5.  **Verification:** How to know it's working (e.g., "Visit http://localhost:3000 - you should see the login screen").

### B. Architectural Insights (ARCHITECTURE.md)
Explain how the system works, avoiding line-by-line code reading.
* **High-Level Overview:** 2-3 sentences summarizing the project's goal.
* **Tech Stack:** A table listing Frontend, Backend, Database, and DevOps tools.
* **Key Components:** Describe the core modules and how they interact.
* **Data Flow:** **[MANDATORY]** Use **Mermaid.js** diagrams to visualize data flow or class hierarchy.
    * *Example:* `graph TD; A[Client] -->|API| B(Server); B --> C{DB};`

### C. Codebase Health & Insights
Provide a "Reviewer's Note" section containing:
* **Complexity Assessment:** Is the code modular or monolithic?
* **Test Coverage:** Are there tests? How do you run them? (`npm test`, `pytest`).
* **Tech Debt/Missing Pieces:** Note any hardcoded secrets, lack of error handling, or deprecated libraries found during the scan.

## 3. Style Guidelines
* **Tone:** Professional, concise, and instructional (Imperative mood).
* **Formatting:** Use Markdown heavily (Headers, **Bold** for commands, code blocks for snippets).
* **No Fluff:** Do not summarize obvious code (e.g., don't say "This function adds two numbers"). Explain *business logic*.

## 4. Execution Template
When asked to document, format your response strictly like this:

```markdown
# Project Documentation Report

## 🚀 Quick Startup Plan
[Step-by-step commands to run the project immediately]

## 🏗 Architecture & Stack
[Overview + Mermaid Diagram + Tech Stack Table]

## 🧠 Codebase Insights
- **Structure:** [Explanation of folder structure]
- **Key Logic:** [Explanation of the hardest part of the code]
- **Observations:** [Critique on code quality/completeness]

## 🧪 Testing & Verification
Explain how to run tests and verify success.

## 5.Handling Missing Information
If critical configuration files (like `requirements.txt` or `.env.example`) are missing:

- **Do not hallucinate.**
- Explicitly state: "⚠️ Missing File: [Filename]."
- Generate the suggested content for that missing file based on imports and code usage.
