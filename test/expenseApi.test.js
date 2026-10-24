const assert = require("node:assert/strict");
const { once } = require("node:events");
const { test } = require("node:test");
const { pool } = require("../db");

let expenses = [];
let nextId = 1;

pool.execute = async (query, values = []) => {
	if (query.includes("INSERT INTO Expense")) {
		const [amount, description, category] = values;
		const id = nextId++;
		expenses.push({ id, amount, description, category, created_at: new Date() });
		return [{ insertId: id }, []];
	}

	if (query.includes("UPDATE Expense")) {
		const [amount, description, category, id] = values;
		const expense = expenses.find((item) => item.id === id);
		if (expense) Object.assign(expense, { amount, description, category });
		return [{ affectedRows: expense ? 1 : 0 }, []];
	}

	if (query.includes("DELETE FROM Expense")) {
		const id = values[0];
		const previousLength = expenses.length;
		expenses = expenses.filter((item) => item.id !== id);
		return [{ affectedRows: previousLength - expenses.length }, []];
	}

	if (query.includes("WHERE id = ?")) {
		return [expenses.filter((item) => item.id === values[0]), []];
	}

	if (query.includes("ORDER BY id DESC")) {
		return [[...expenses].sort((left, right) => right.id - left.id), []];
	}

	throw new Error(`Unexpected SQL in API test: ${query}`);
};

const { app } = require("../server");

test("expense API supports persistent CRUD behavior and validates input", async (t) => {
	expenses = [];
	nextId = 1;
	const server = app.listen(0, "127.0.0.1");
	await once(server, "listening");
	t.after(() => new Promise((resolve, reject) => {
		server.close((error) => error ? reject(error) : resolve());
	}));

	const baseUrl = `http://127.0.0.1:${server.address().port}/api/expenses`;
	const listResponse = await fetch(baseUrl);
	assert.equal(listResponse.status, 200);
	assert.deepEqual(await listResponse.json(), []);

	const createResponse = await fetch(baseUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ amount: 12.5, description: "Lunch", category: "Food" })
	});
	assert.equal(createResponse.status, 201);
	const created = await createResponse.json();
	assert.equal(created.id, 1);
	assert.equal(created.amount, 12.5);
	assert.equal(created.description, "Lunch");

	const persistedResponse = await fetch(baseUrl);
	assert.equal((await persistedResponse.json()).length, 1);

	const updateResponse = await fetch(`${baseUrl}/1`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ amount: 13.75, description: "Dinner", category: "Food" })
	});
	assert.equal(updateResponse.status, 200);
	assert.equal((await updateResponse.json()).description, "Dinner");

	const invalidResponse = await fetch(baseUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ amount: 1.001, description: "Invalid", category: "Food" })
	});
	assert.equal(invalidResponse.status, 400);

	const deleteResponse = await fetch(`${baseUrl}/1`, { method: "DELETE" });
	assert.equal(deleteResponse.status, 204);
	assert.equal((await fetch(`${baseUrl}/1`, { method: "DELETE" })).status, 404);
	assert.deepEqual(await (await fetch(baseUrl)).json(), []);
});
