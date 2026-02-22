const fs = require('fs');

const logError = (message, err) => {
    const logEntry = `[${new Date().toISOString()}] ${message}\nError: ${err.message}\nStack: ${err.stack}\n\n`;
    try {
        fs.appendFileSync('server_error.log', logEntry);
    } catch (_) { }
    console.error(message, err);
};

module.exports = { logError };
