const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const { extractTextContent, getAnswerFromPdfContent } = require('../controllers/pdfController');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

// POST /upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        // Use the buffer from memory storage
        const pdfContentResponse = await extractTextContent(req.file.buffer);

        if (!pdfContentResponse.success) {
            return res.status(400).json(pdfContentResponse);
        }

        res.json(pdfContentResponse);
    } catch (error) {
        console.error("Error occurred in /upload:", error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
});

// POST /submit_pdf
app.post('/submit_pdf', async (req, res) => {
    try {
        const { pdfContent, userQuestion } = req.body;

        if (!pdfContent || !userQuestion) {
            return res.status(400).json({ success: false, message: 'Missing required fields: pdfContent or userQuestion.' });
        }

        const apiResponse = await getAnswerFromPdfContent(pdfContent, userQuestion);
        return res.status(200).json(apiResponse);
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = app; // Export the app for Vercel to use
