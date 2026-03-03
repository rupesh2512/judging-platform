const mongoose = require("mongoose");
const { Worker } = require("bullmq");
const Redis = require("ioredis");
const Submission = require("./models/submission.model");
const runSandbox = require("./sandboxRunner");

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("Worker connected to MongoDB"))
	.catch((err) => console.error("Mongo error:", err));

const connection = new Redis({
	host: process.env.REDIS_HOST,
	maxRetriesPerRequest: null,
});

new Worker(
	"submissionQueue",
	async (job) => {
		const { submissionId } = job.data;
		const submission = await Submission.findById(submissionId);

		if (!submission) {
			console.warn("Submission not found:", submissionId);
			return; // Don't throw — nothing to retry
		}

		submission.status = "running";
		await submission.save();

		// FIX: wrap sandbox in try/catch so failures mark submission as "failed"
		// instead of leaving it stuck at "running" forever
		try {
			const result = await runSandbox(submission);
			submission.status = "completed";
			submission.stdout = result.stdout;
			submission.stderr = result.stderr;
			submission.verdict = result.verdict;
		} catch (err) {
			console.error("Sandbox error for", submissionId, err);
			submission.status = "failed";
			submission.stderr = err.message;
			submission.verdict = "Internal Error";
		}

		await submission.save();
		console.log("Submission done:", submissionId, submission.verdict);
	},
	{
		connection,
		// FIX: limit retries — don't retry infinitely on crash
		defaultJobOptions: {
			attempts: 2,
			backoff: { type: "exponential", delay: 1000 },
		},
	},
);

console.log("Worker started");
