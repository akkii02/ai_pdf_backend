const axios = require('axios');
const pdfParse = require('pdf-parse');
const fs = require('fs');

// Function to extract text from the PDF file
exports.extractTextContent = async (file) => {
    try {
        // Read the PDF file buffer
        const dataBuffer = fs.readFileSync(file);
        // Parse the PDF content
        const pdfData = await pdfParse(dataBuffer);
        // Return the extracted text content
        return {
            success: true,
            message: 'PDF content extracted successfully.',
            data: pdfData.text // pdfData.text contains the extracted text
        };
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        
        // Return a structured response on failure
        return {
            success: false,
            message: 'Failed to extract text from PDF.',
            error: error.message,
        };
    }
};

// Function to get an answer from the Cloudflare API based on PDF content and user question
exports.getAnswerFromPdfContent = async (pdfContent, userQuestion) => {
    async function callCloudflareAPI(input) {
        try {
            const response = await axios.post(
                'https://api.cloudflare.com/client/v4/accounts/9ea35c2164bbbe583bf6244587ffeb5e/ai/run/@cf/meta/llama-3-8b-instruct',
                input,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.API_KEY}`, // Use the actual token from environment variable
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error in Cloudflare API request:', error);
            const message = error.response ? error.response.data.message : error.message;
            throw new Error(message);
        }
    }

    const input = {
        messages: [
            {
                role: 'system',
                content: `You are an intelligent assistant designed to provide accurate answers based on the provided text content. If the information necessary to answer a question is not present in the text, you may use your general knowledge to assist. Below is the relevant text content: ${pdfContent}`,
            },
            {
                role: 'user',
                content: `Based on the text content provided, please answer my question: ${userQuestion}`,
            },
        ],
    };
    
    try {
        const response = await callCloudflareAPI(input);
        return {
            success: true,
            message: 'Answer fetched successfully.',
            data: response,
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
