const axios = require('axios');
const pdfParse = require('pdf-parse');

// Function to extract text from the PDF file buffer
exports.extractTextContent = async (buffer) => {
    try {
        const pdfData = await pdfParse(buffer);
        return {
            success: true,
            message: 'PDF content extracted successfully.',
            data: pdfData.text // pdfData.text contains the extracted text
        };
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return {
            success: false,
            message: 'Failed to extract text from PDF.',
            error: error.message,
        };
    }
};

// Function to get an answer from the Cloudflare API based on PDF content and user question
exports.getAnswerFromPdfContent = async (pdfContent, userQuestion) => {
    const input = {
        messages: [
            {
                role: 'system',
                content: `You are an intelligent assistant designed to provide accurate answers based on the provided text content. Below is the relevant text content: ${pdfContent}`,
            },
            {
                role: 'user',
                content: `Please answer my question: ${userQuestion}`,
            },
        ],
    };

    try {
        const response = await axios.post(
            'https://api.cloudflare.com/client/v4/accounts/9ea35c2164bbbe583bf6244587ffeb5e/ai/run/@cf/meta/llama-3-8b-instruct',
            input,
            {
                headers: {
                    Authorization: `Bearer ${process.env.API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return {
            success: true,
            message: 'Answer fetched successfully.',
            data: response.data,
        };
    } catch (error) {
        console.error('Error fetching answer from Cloudflare API:', error);
        return {
            success: false,
            message: 'Failed to fetch answer from Cloudflare API.',
            error: error.message,
        };
    }
};
