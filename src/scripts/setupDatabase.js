import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database.js';
import huggingfaceService from '../service/huggingfaceService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const setupDatabase = async () => {
    try {
        console.log('Setting up database...');
        console.log('Waiting for database to be ready...');

        await new Promise(resolve => setTimeout(resolve, 2000));

        const testResult = await pool.query('SELECT 1 as test');

        const schemaPath = path.join(__dirname, '../models/database.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    const result = await pool.query(statement);
                } catch (err) {
                    if (err.code !== '42P07') {
                        console.error('Error executing statement:', err.message);
                        throw err;
                    }
                }
            }
        }

        console.log('Database setup completed successfully!');

        await addSampleData();

        console.log('All setup completed successfully!');

    } catch (error) {
        console.error('Database setup failed:', error);
    } finally {
        await pool.end();
    }
}

const addSampleData = async () => {
    console.log('Adding sample FAQs with embeddings...');

    const sampleFAQs = [
        {
            question: "What are your business hours?",
            answer: "We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and public holidays.",
            category: "general"
        },
        {
            question: "How do I reset my password?",
            answer: "To reset your password, click on the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your email.",
            category: "account"
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. We also offer payment plans for larger purchases.",
            category: "payment"
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number on our website's order tracking page or the courier's website.",
            category: "shipping"
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unused items in original packaging. Returns are free for defective items, while customer-initiated returns may incur a restocking fee.",
            category: "returns"
        }
    ];

    for (const faq of sampleFAQs) {
        try {
            const faqText = `${faq.question} ${faq.answer}`;
            const embedding = await huggingfaceService.requestEmbedding(faqText);
            
            const result = await pool.query(
                'INSERT INTO faqs (question, answer, category, embedding) VALUES ($1, $2, $3, $4) RETURNING id',
                [faq.question, faq.answer, faq.category, embedding ? JSON.stringify(embedding) : null]
            );
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (err) {
            if (err.code !== '23505') {
                console.error(`Error inserting FAQ: ${err.message}`);
            }
        }
    }

    console.log('Sample data with embeddings added successfully!');
}

const normalizedArgvPath = process.argv[1].replace(/\\/g, '/');
const expectedPath = `file:///${normalizedArgvPath}`;

if (import.meta.url === expectedPath) {
    setupDatabase();
}

export default { setupDatabase };