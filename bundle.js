const fs = require("fs");
const path = require("path");

const srcDir = path.resolve(__dirname, "src");
const indexPath = path.resolve(__dirname, "index.js");
const routePath = path.resolve(srcDir, "routeGetRequest.js");

function bundle() {
	const functionNames = extractFunctionNames(path.resolve(srcDir, "getData.js"));
	const switchStatement = generateSwitchStatement(functionNames);
	const finalContent = combineFiles(srcDir, switchStatement);

	writeOutputFile(indexPath, finalContent);
	writeRouteFile(routePath, switchStatement);

	console.log("Bundling complete. The worker is ready as index.js and routeGetRequest.js");
}

function extractFunctionNames(filePath) {
	const fileContent = readFileContent(filePath);
	const functionNames = fileContent
		.match(/export function (\w+)/g)
		.map((match) => match.replace("export function ", ""));
	return functionNames;
}

function generateSwitchStatement(functionNames) {
	let switchStatement = "function routeGetRequest(pathname, data) {\n";
	switchStatement += "    switch (pathname) {\n";

	functionNames.forEach((functionName) => {
		const routePath = createRoutePath(functionName);
		switchStatement += `        case '${routePath}':\n`;
		switchStatement += `            return ${functionName}(data);\n`;
	});

	switchStatement += "        default:\n";
	switchStatement += "            return jsonResponse({ error: 'Endpoint Not Found' }, 404);\n";
	switchStatement += "    }\n";
	switchStatement += "}\n";

	return switchStatement;
}

function createRoutePath(functionName) {
	return (
		"/" +
		functionName
			.replace(/^get/, "")
			.replace(/([a-z])([A-Z])/g, "$1_$2")
			.toLowerCase()
	);
}

function combineFiles(srcDir, switchStatement) {
	let finalContent = "";

	const files = fs.readdirSync(srcDir);
	files.forEach((file) => {
		const filePath = path.resolve(srcDir, file);
		let fileContent = readFileContent(filePath);
		fileContent = removeImportsExports(fileContent);
		finalContent += "\n\n" + fileContent;
	});

	finalContent += "\n\n" + switchStatement;

	return finalContent;
}

function removeImportsExports(content) {
	let modifiedContent = content.replace(/import .+ from .+;/g, "");
	modifiedContent = modifiedContent.replace(/export /g, "");
	return modifiedContent;
}

function readFileContent(filePath) {
	return fs.readFileSync(filePath, "utf-8");
}

function writeOutputFile(outputPath, content) {
	fs.writeFileSync(outputPath, content);
}

function writeRouteFile(routePath, switchStatement) {
	const content = switchStatement + "\n\nexport { routeGetRequest };";
	fs.writeFileSync(routePath, content);
}

bundle();
