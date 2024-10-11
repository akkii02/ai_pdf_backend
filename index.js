// index.js
const express = require('express');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { extractTextContent, getAnswerFromPdfContent } = require('../controllers/pdfController.module');
require('dotenv').config();

const app = express();


app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDFs are allowed!'), false);
        }
        cb(null, true);
    },
});

app.use(cors());
app.use(bodyParser.json());

// POST /upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const filePath = req.file.path;
        const pdfContentResponse = await extractTextContent(filePath);

        if (!pdfContentResponse.success) {
            return res.status(400).json(pdfContentResponse);
        }

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        res.json(pdfContentResponse);
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Internal Server Error");
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
