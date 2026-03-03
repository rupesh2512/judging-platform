const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
	{
		code: { type: String, required: true },
		language: { type: String, required: true },
		status: {
			type: String,
			enum: ["queued", "running", "completed", "failed"],
			default: "queued",
		},
		stdout: { type: String, default: "" },
		stderr: { type: String, default: "" },
		verdict: { type: String, default: "" },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Submission", submissionSchema);
