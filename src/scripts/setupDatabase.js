import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database.js';
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
                    console.log('Executing:', statement.substring(0, 50) + '...');
                    const result = await pool.query(statement);
                    console.log('✅ Executed successfully');
                } catch (err) {
                    console.error('❌ Error executing statement:', err.message);
                    console.error('Error code:', err.code);
                    if (err.code !== '42P07') {
                        throw err;
                    }
                }
            }
        }

        console.log('Database setup completed successfully!');

        await addSampleData();

    } catch (error) {
        console.error('Database setup failed:', error);
    } finally {
        await pool.end();
    }
}

const addSampleData = async () => {
    console.log('Adding sample FAQs');

    const sampleFAQs = [
        {
            question: "What are your business hours?",
            answer: "We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and public holidays.",
            category: "general",
            keywords: ["hours", "open", "closed", "schedule", "timing"]
        },
        {
            question: "How do I reset my password?",
            answer: "To reset your password, click on the 'Forgot Password' link on the login page, enter your email address, and follow the instructions sent to your email.",
            category: "account",
            keywords: ["password", "reset", "forgot", "login", "email"]
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. We also offer payment plans for larger purchases.",
            category: "payment",
            keywords: ["payment", "credit card", "paypal", "visa", "mastercard"]
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number on our website's order tracking page or the courier's website.",
            category: "shipping",
            keywords: ["track", "order", "shipping", "delivery", "status"]
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unused items in original packaging. Returns are free for defective items, while customer-initiated returns may incur a restocking fee.",
            category: "returns",
            keywords: ["return", "refund", "exchange", "policy", "defective"]
        }
    ];

    for (const faq of sampleFAQs) {
        try {
            await pool.query(
                'INSERT INTO faqs (question, answer, category, embedding) VALUES ($1, $2, $3, $4)',
                [faq.question, faq.answer, faq.category, null]
            );
        } catch (err) {
            console.log('FAQ already exists or error inserting:', faq.question.substring(0, 30));
        }
    }

    console.log('Sample data added successfully!');
}

const normalizedArgvPath = process.argv[1].replace(/\\/g, '/');
const expectedPath = `file:///${normalizedArgvPath}`;

if (import.meta.url === expectedPath) {
    setupDatabase();
}

export default { setupDatabase };