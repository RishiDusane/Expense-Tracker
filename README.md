# Expense Tracker

Expense Tracker is a small HTML, CSS, and JavaScript app backed by an Express API and MySQL. Expenses are stored in the `Expense` table and remain available after a page refresh. The app supports creating, listing, editing, and deleting expenses.

## Requirements

- Node.js 18 or newer
- MySQL 8 or newer

## Run locally

1. Create the MySQL database:

   ```sql
   CREATE DATABASE expense_tracker;
   ```

2. Install the Node.js dependencies:

   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for your MySQL server.
4. Start the app:

   ```powershell
   npm start
   ```

5. Open <http://localhost:3000>.

On startup, the server creates the `Expense` table if it does not already exist. Keep `.env` private; it is excluded from Git.

## Expense API

All endpoints use `/api/expenses` and exchange JSON.

| Method | Endpoint | Action |
| --- | --- | --- |
| `GET` | `/api/expenses` | List expenses, newest first |
| `POST` | `/api/expenses` | Create an expense |
| `PUT` | `/api/expenses/:id` | Update an expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense |

Create and update request bodies have this shape:

```json
{
  "amount": 12.5,
  "description": "Lunch",
  "category": "Food"
}
```

Amounts must be positive and have at most two decimal places. The API responds with a validation error for invalid input and a not-found error for missing expense IDs.
