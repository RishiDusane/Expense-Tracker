const amountInput = document.querySelector("#amount");
const descriptionInput = document.querySelector("#description");
const categoryInput = document.querySelector("#category");
const submitButton = document.querySelector("#submit-button");
const expenseList = document.querySelector("#expense-list");

let expenses = [];
let editingId = null;

function renderExpenses() {
	expenseList.replaceChildren();

	expenses.forEach((expense) => {
		const item = document.createElement("li");
		item.append(`${expense.amount} - ${expense.category} - ${expense.description} `);

		const editButton = document.createElement("button");
		editButton.type = "button";
		editButton.textContent = "Edit Expense";
		editButton.addEventListener("click", () => startEditing(expense.id));

		const deleteButton = document.createElement("button");
		deleteButton.type = "button";
		deleteButton.textContent = "Delete Expense";
		deleteButton.addEventListener("click", () => deleteExpense(expense.id));

		item.append(deleteButton, editButton);
		expenseList.append(item);
	});
}

function clearInputs() {
	amountInput.value = "";
	descriptionInput.value = "";
	editingId = null;
}

function startEditing(id) {
	const expense = expenses.find((item) => item.id === id);
	if (!expense) return;

	amountInput.value = expense.amount;
	descriptionInput.value = expense.description;
	categoryInput.value = expense.category;
	editingId = id;
	amountInput.focus();
}

function deleteExpense(id) {
	expenses = expenses.filter((expense) => expense.id !== id);
	if (editingId === id) clearInputs();
	renderExpenses();
}

submitButton.addEventListener("click", () => {
	const expenseData = {
		amount: Number(amountInput.value),
		description: descriptionInput.value.trim(),
		category: categoryInput.value
	};

	if (editingId === null) {
		expenses.push({ id: crypto.randomUUID(), ...expenseData });
	} else {
		expenses = expenses.map((expense) => expense.id === editingId ? { ...expense, ...expenseData } : expense);
	}

	renderExpenses();
	clearInputs();
});

renderExpenses();
