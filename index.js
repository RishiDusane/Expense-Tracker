const amountInput = document.querySelector("#amount");
const descriptionInput = document.querySelector("#description");
const categoryInput = document.querySelector("#category");
const expenseForm = document.querySelector("#expense-form");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const statusMessage = document.querySelector("#status");
const expenseList = document.querySelector("#expense-list");

const API_URL = "/api/expenses";
let expenses = [];
let editingId = null;

function setStatus(message, isError = false) {
	statusMessage.textContent = message;
	statusMessage.classList.toggle("error", isError);
}

async function request(url, options) {
	const response = await fetch(url, options);
	if (response.status === 204) return null;

	const result = await response.json();
	if (!response.ok) {
		throw new Error(result.error || "The request could not be completed.");
	}
	return result;
}

function createActionButton(label, action) {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;
	button.addEventListener("click", () => action());
	return button;
}
//
function renderExpenses() {
	expenseList.replaceChildren();

	expenses.forEach((expense) => {
		const item = document.createElement("li");
		item.append(`₹${Number(expense.amount).toFixed(2)} - ${expense.category} - ${expense.description} `);
		item.append(
			createActionButton("Delete Expense", async () => deleteExpense(expense.id)),
			createActionButton("Edit Expense", () => startEditing(expense.id))
		);
		expenseList.append(item);
	});
}

function clearInputs() {
	amountInput.value = "";
	descriptionInput.value = "";
	categoryInput.selectedIndex = 0;
	editingId = null;
	submitButton.textContent = "Add Expense";
	cancelEditButton.hidden = true;
}

function startEditing(id) {
	const expense = expenses.find((item) => item.id === id);
	if (!expense) return;

	amountInput.value = expense.amount;
	descriptionInput.value = expense.description;
	categoryInput.value = expense.category;
	editingId = id;
	submitButton.textContent = "Save Changes";
	cancelEditButton.hidden = false;
	amountInput.focus();
}

async function deleteExpense(id) {
	try {
		await request(`${API_URL}/${id}`, { method: "DELETE" });
		expenses = expenses.filter((expense) => expense.id !== id);
		if (editingId === id) clearInputs();
		renderExpenses();
		setStatus("Expense deleted.");
	} catch (error) {
		setStatus(error.message, true);
	}
}

expenseForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const expenseData = {
		amount: Number(amountInput.value),
		description: descriptionInput.value.trim(),
		category: categoryInput.value
	};

	const isEditing = editingId !== null;
	try {
		const savedExpense = await request(
			isEditing ? `${API_URL}/${editingId}` : API_URL,
			{
				method: isEditing ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(expenseData)
			}
		);

		expenses = editingId === null
			? [savedExpense, ...expenses]
			: expenses.map((expense) => expense.id === editingId ? savedExpense : expense);
		renderExpenses();
		clearInputs();
		setStatus(isEditing ? "Expense updated." : "Expense added.");
	} catch (error) {
		setStatus(error.message, true);
	}
});

cancelEditButton.addEventListener("click", () => {
	clearInputs();
	setStatus("Edit cancelled.");
});

async function loadExpenses() {
	try {
		expenses = await request(API_URL);
		renderExpenses();
		setStatus("");
	} catch (error) {
		setStatus(`Could not load expenses: ${error.message}`, true);
	}
}

loadExpenses();
