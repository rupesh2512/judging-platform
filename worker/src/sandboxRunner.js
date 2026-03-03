// const fs = require("fs");
// const path = require("path");
// const { spawn } = require("child_process");

// // const LANGUAGE_CONFIG = {
// // 	python: {
// // 		image: "sandbox-python",
// // 		filename: "solution.py",
// // 	},
// // 	// javascript: { image: "sandbox-node", filename: "solution.js" },
// // 	// cpp: { image: "sandbox-cpp", filename: "solution.cpp" },
// // };

// const LANGUAGE_CONFIG = {
// 	python: {
// 		image: "sandbox-python",
// 		ext: "py",
// 	},
// 	javascript: {
// 		image: "sandbox-javascript",
// 		ext: "js",
// 	},
// 	cpp: {
// 		image: "sandbox-cpp",
// 		ext: "cpp",
// 	},
// };

// const TIME_LIMIT_MS = 5000;

// async function runSandbox(submission) {
// 	return new Promise((resolve) => {
// 		const language = (submission.language || "python").toLowerCase();
// 		const config = LANGUAGE_CONFIG[language];

// 		if (!config) {
// 			return resolve({
// 				stdout: "",
// 				stderr: `Unsupported language: ${language}`,
// 				verdict: "Compile Error",
// 			});
// 		}

// 		// FIX 1: Correct temp dir — matches the bind mount path below
// 		const tempDir = "/app/temp";
// 		const hostTempDir = process.env.HOST_TEMP_PATH;
// 		const filename = `solution_${submission._id}.${config.ext}`;
// 		const filePath = path.join(tempDir, filename);

// 		try {
// 			fs.mkdirSync(tempDir, { recursive: true });
// 			fs.writeFileSync(filePath, submission.code);
// 		} catch (err) {
// 			return resolve({
// 				stdout: "",
// 				stderr: `Failed to write code file: ${err.message}`,
// 				verdict: "Internal Error",
// 			});
// 		}

// 		const dockerArgs = [
// 			"run",
// 			"--name",
// 			containerId,
// 			"--rm",
// 			"--memory=128m",
// 			"--cpus=0.5",
// 			"--network=none",
// 			"--pids-limit=64",
// 			"--cap-drop=ALL",
// 			"--read-only",
// 			"--mount",
// 			"type=tmpfs,destination=/tmp,tmpfs-size=67108864", // ← replaces --tmpfs
// 			"--security-opt=no-new-privileges",
// 			"--ulimit",
// 			"core=0",
// 			"-v",
// 			`${hostTempDir}/${filename}:/home/sandbox/${filename}:ro`,
// 			config.image,
// 			filename,
// 		];

// 		const docker = spawn("docker", dockerArgs);

// 		let stdout = "";
// 		let stderr = "";
// 		let timedOut = false;

// 		// FIX 3: Kill container after TIME_LIMIT_MS and return TLE
// 		const timer = setTimeout(() => {
// 			timedOut = true;
// 			docker.kill("SIGKILL");
// 		}, TIME_LIMIT_MS);

// 		docker.stdout.on("data", (d) => (stdout += d.toString()));
// 		docker.stderr.on("data", (d) => (stderr += d.toString()));

// 		docker.on("close", (exitCode) => {
// 			clearTimeout(timer);
// 			try {
// 				fs.unlinkSync(filePath);
// 			} catch (_) {}

// 			if (timedOut) {
// 				return resolve({
// 					stdout,
// 					stderr: "Time Limit Exceeded",
// 					verdict: "Time Limit Exceeded",
// 				});
// 			}

// 			// FIX 4: Verdict based on exit code, not stderr presence
// 			// compilers write to stderr even on success — exit code is the truth
// 			let verdict;
// 			if (exitCode === 0) verdict = "Accepted";
// 			else if (exitCode === 2) verdict = "Compile Error";
// 			else verdict = "Runtime Error";

// 			resolve({ stdout, stderr, verdict });
// 		});

// 		docker.on("error", (err) => {
// 			clearTimeout(timer);
// 			resolve({
// 				stdout: "",
// 				stderr: `Docker spawn failed: ${err.message}`,
// 				verdict: "Internal Error",
// 			});
// 		});
// 	});
// }

// module.exports = runSandbox;

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const LANGUAGE_CONFIG = {
	python: {
		image: "sandbox-python",
		ext: "py",
	},
	javascript: {
		image: "sandbox-javascript",
		ext: "js",
	},
	cpp: {
		image: "sandbox-cpp",
		ext: "cpp",
	},
};

const TIME_LIMIT_MS = 5000;

async function runSandbox(submission) {
	return new Promise((resolve) => {
		const language = (submission.language || "python").toLowerCase();
		const config = LANGUAGE_CONFIG[language];

		if (!config) {
			return resolve({
				stdout: "",
				stderr: `Unsupported language: ${language}`,
				verdict: "Compile Error",
			});
		}

		const tempDir = "/app/temp";
		const hostTempDir = process.env.HOST_TEMP_PATH;
		const filename = `solution_${submission._id}.${config.ext}`;
		const filePath = path.join(tempDir, filename);
		const containerId = `sandbox_${submission._id}`; // FIX: declare containerId

		try {
			fs.mkdirSync(tempDir, { recursive: true });
			fs.writeFileSync(filePath, submission.code);
		} catch (err) {
			return resolve({
				stdout: "",
				stderr: `Failed to write code file: ${err.message}`,
				verdict: "Internal Error",
			});
		}

		const isCompiled = language === "cpp";

		const dockerArgs = [
			"run",
			"--name",
			containerId,
			"--rm",
			"--memory=128m",
			"--cpus=0.5",
			"--network=none",
			"--pids-limit=64",
			"--cap-drop=ALL",
			// read-only breaks compiled languages on Docker Desktop (Windows/Mac)
			// because tmpfs is always mounted noexec
			...(isCompiled ? [] : ["--read-only"]),
			"--security-opt=no-new-privileges",
			"--ulimit",
			"core=0",
			"-v",
			`${hostTempDir}/${filename}:/input/${filename}:ro`,
			config.image,
			filename,
		];

		const docker = spawn("docker", dockerArgs);

		let stdout = "";
		let stderr = "";
		let timedOut = false;

		const timer = setTimeout(() => {
			timedOut = true;
			// FIX: kill by container name — works on Windows too
			spawn("docker", ["kill", containerId]);
		}, TIME_LIMIT_MS);

		docker.stdout.on("data", (d) => (stdout += d.toString()));
		docker.stderr.on("data", (d) => (stderr += d.toString()));

		docker.on("close", (exitCode) => {
			clearTimeout(timer);
			try {
				fs.unlinkSync(filePath);
			} catch (_) {}

			if (timedOut) {
				return resolve({
					stdout,
					stderr: "Time Limit Exceeded",
					verdict: "Time Limit Exceeded",
				});
			}

			let verdict;
			if (exitCode === 0) verdict = "Accepted";
			else if (exitCode === 2) verdict = "Compile Error";
			else verdict = "Runtime Error";

			resolve({ stdout, stderr, verdict });
		});

		docker.on("error", (err) => {
			clearTimeout(timer);
			resolve({
				stdout: "",
				stderr: `Docker spawn failed: ${err.message}`,
				verdict: "Internal Error",
			});
		});
	});
}

module.exports = runSandbox;
