const mysql = require("mysql2/promise");

const pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "expense_tracker",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

async function initializeDatabase() {
	await pool.execute(`
		CREATE TABLE IF NOT EXISTS Expense (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			amount DECIMAL(10, 2) NOT NULL,
			description VARCHAR(255) NOT NULL,
			category VARCHAR(100) NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
}

module.exports = { pool, initializeDatabase };
