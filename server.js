require("dotenv").config();

const path = require("path");
const express = require("express");
const expenseRoutes = require("./routes/expenseRoutes");
const { initializeDatabase } = require("./db");

const app = express();

app.use(express.json());
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/index.js", (req, res) => res.sendFile(path.join(__dirname, "index.js")));
app.get("/style.css", (req, res) => res.sendFile(path.join(__dirname, "style.css")));
app.use("/api/expenses", expenseRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Not found." });
});

app.use((error, req, res, next) => {
	console.error(error);
	if (res.headersSent) return next(error);
	if (error.type === "entity.parse.failed") {
		return res.status(400).json({ error: "Request body must contain valid JSON." });
	}
	res.status(500).json({ error: "An unexpected server error occurred." });
});

async function startServer() {
	await initializeDatabase();
	const port = Number(process.env.PORT || 3000);
	app.listen(port, () => {
		console.log(`Expense tracker is running at http://localhost:${port}`);
	});
}

if (require.main === module) {
	startServer().catch((error) => {
		console.error("Could not start the expense tracker:", error);
		process.exitCode = 1;
	});
}

module.exports = { app, startServer };
