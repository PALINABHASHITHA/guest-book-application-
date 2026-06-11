const express = require("express");
const Message = require("../models/message");

const router = express.Router();

router.get("/", async (req, res) => {
	try {
		const messages = await Message.find().sort({ createdAt: -1 });
		res.json(messages);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const name = req.body.name?.trim();
		const message = req.body.message?.trim();

		if (!name || !message) {
			return res.status(400).json({ message: "Name and message are required" });
		}

		const createdMessage = await Message.create({ name, message });
		res.status(201).json(createdMessage);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
