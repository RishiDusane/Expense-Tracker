const { pool } = require("../db");

const MAX_AMOUNT = 99999999.99;

function validateExpense(body = {}) {
	if (!body || typeof body !== "object") body = {};
	const amount = Number(body.amount);
	const description = typeof body.description === "string" ? body.description.trim() : "";
	const category = typeof body.category === "string" ? body.category.trim() : "";

	if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT ||
		Number(amount.toFixed(2)) !== amount) {
		return { error: "Amount must be a positive value with no more than two decimal places." };
	}
	if (!description || description.length > 255) {
		return { error: "Description is required and must be 255 characters or fewer." };
	}
	if (!category || category.length > 100) {
		return { error: "Category is required and must be 100 characters or fewer." };
	}

	return { amount, description, category };
}

function parseId(value) {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 && id <= 4294967295 ? id : null;
}

async function getExpenses(req, res, next) {
	try {
		const [rows] = await pool.execute(
			"SELECT id, amount, description, category, created_at FROM Expense ORDER BY id DESC"
		);
		res.json(rows.map((row) => ({ ...row, id: Number(row.id), amount: Number(row.amount) })));
	} catch (error) {
		next(error);
	}
}

async function createExpense(req, res, next) {
	try {
		const expense = validateExpense(req.body);
		if (expense.error) return res.status(400).json({ error: expense.error });

		const [result] = await pool.execute(
			"INSERT INTO Expense (amount, description, category) VALUES (?, ?, ?)",
			[expense.amount, expense.description, expense.category]
		);
		const [rows] = await pool.execute(
			"SELECT id, amount, description, category, created_at FROM Expense WHERE id = ?",
			[result.insertId]
		);
		const row = rows[0];
		res.status(201).json({ ...row, id: Number(row.id), amount: Number(row.amount) });
	} catch (error) {
		next(error);
	}
}

async function updateExpense(req, res, next) {
	try {
		const id = parseId(req.params.id);
		if (id === null) return res.status(400).json({ error: "Expense ID must be a positive integer." });

		const expense = validateExpense(req.body);
		if (expense.error) return res.status(400).json({ error: expense.error });

		await pool.execute(
			"UPDATE Expense SET amount = ?, description = ?, category = ? WHERE id = ?",
			[expense.amount, expense.description, expense.category, id]
		);
		const [rows] = await pool.execute(
			"SELECT id, amount, description, category, created_at FROM Expense WHERE id = ?",
			[id]
		);
		if (rows.length === 0) return res.status(404).json({ error: "Expense not found." });

		const row = rows[0];
		res.json({ ...row, id: Number(row.id), amount: Number(row.amount) });
	} catch (error) {
		next(error);
	}
}

async function deleteExpense(req, res, next) {
	try {
		const id = parseId(req.params.id);
		if (id === null) return res.status(400).json({ error: "Expense ID must be a positive integer." });

		const [result] = await pool.execute("DELETE FROM Expense WHERE id = ?", [id]);
		if (result.affectedRows === 0) return res.status(404).json({ error: "Expense not found." });
		res.status(204).end();
	} catch (error) {
		next(error);
	}
}

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
