const express = require("express");
const mongoose = require("mongoose");
const { Queue } = require("bullmq");
const Redis = require("ioredis");
const Submission = require("./models/submission.model"); // FIX: use shared model

const app = express();
app.use(express.json());

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("API connected to MongoDB"))
	.catch((err) => console.error(err));

const connection = new Redis({
	host: process.env.REDIS_HOST,
	maxRetriesPerRequest: null,
});
const submissionQueue = new Queue("submissionQueue", { connection });

const SUPPORTED_LANGUAGES = ["python", "javascript", "cpp"];

app.post("/submit", async (req, res) => {
	try {
		const { code, language } = req.body;

		// FIX: validate before queuing
		if (!code || typeof code !== "string" || code.trim() === "") {
			return res
				.status(400)
				.json({ error: "'code' is required and must be a non-empty string." });
		}
		if (!language || typeof language !== "string") {
			return res.status(400).json({ error: "'language' is required." });
		}
		if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
			return res.status(400).json({
				error: `Unsupported language '${language}'. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
			});
		}

		const submission = await Submission.create({
			code: code.trim(),
			language: language.toLowerCase(),
			status: "queued",
		});

		await submissionQueue.add("newSubmission", {
			submissionId: submission._id.toString(),
		});

		res
			.status(201)
			.json({ message: "Submission queued", submissionId: submission._id });
	} catch (err) {
		console.error("Submit error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/submission/:id", async (req, res) => {
	try {
		const submission = await Submission.findById(req.params.id);
		if (!submission)
			return res.status(404).json({ error: "Submission not found" });
		res.json(submission);
	} catch (err) {
		if (err.name === "CastError")
			return res.status(400).json({ error: "Invalid submission ID" });
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/", (_, res) => res.send("CodeArena API Running"));
app.listen(3000, () => console.log("API running on port 3000"));
