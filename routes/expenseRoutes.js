const express = require("express");
const {
	getExpenses,
	createExpense,
	updateExpense,
	deleteExpense
} = require("../controllers/expenseController");

const router = express.Router();

router.route("/")
	.get(getExpenses)
	.post(createExpense);

router.route("/:id")
	.put(updateExpense)
	.delete(deleteExpense);

module.exports = router;
