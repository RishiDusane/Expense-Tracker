const amountInput = document.querySelector("#amount");
const descriptionInput = document.querySelector("#description");
const categoryInput = document.querySelector("#category");
const submitButton = document.querySelector("#submit-button");
const expenseList = document.querySelector("#expense-list");

let expenses = [];
let editingId = null;

function createActionButton(label, action) {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;
	button.addEventListener("click", action);
	return button;
}
//
function renderExpenses() {
	expenseList.replaceChildren();

	expenses.forEach((expense) => {
		const item = document.createElement("li");
		item.append(`${expense.amount} - ${expense.category} - ${expense.description} `);

		item.append(
			createActionButton("Delete Expense", () => deleteExpense(expense.id)),
			createActionButton("Edit Expense", () => startEditing(expense.id))
		);
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

	expenses = editingId === null
		? [...expenses, { id: crypto.randomUUID(), ...expenseData }]
		: expenses.map((expense) => expense.id === editingId ? { ...expense, ...expenseData } : expense);

	renderExpenses();
	clearInputs();
});

renderExpenses();
