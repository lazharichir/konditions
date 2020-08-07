process.env.LOGGER_THRESHOLD = 2

module.exports = {
	roots: [`<rootDir>/src/`],
	testMatch: [`**/?(*.)+(spec|test).+(ts|tsx|js)`],
	transform: {
		"^.+\\.(ts|tsx)$": `ts-jest`,
	},
	globals: {
		"ts-jest": {
			diagnostics: false,
		},
	},
	moduleDirectories: [`node_modules`, `src`],
}
