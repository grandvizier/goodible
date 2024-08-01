#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const filePath = path.resolve("goodreads_library_export.csv");

fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
        const isbn13Field = row.ISBN13;
        const match = isbn13Field ? isbn13Field.match(/\d+/) : null; // Extract only the numeric part
        const isbn13 = match ? match[0] : null;

        if (!isbn13 && row.Title) {
            const titleWithoutParentheses = row.Title.replace(/\s*\(.*?\)\s*/g, '').trim();
            const query = encodeURIComponent(titleWithoutParentheses);
            const url = `https://openlibrary.org/search.json?q=${query}&fields=title,author_name,isbn`;

            try {
                const response = await axios.get(url);
                const books = response.data.docs;

                if (books.length > 0) {
                    console.log(titleWithoutParentheses)
                    console.log(`  found: `, books.length)
                    books.forEach(book => {
                        let isbns = book.isbn ? book.isbn.filter(isbn => isbn.length === 13).slice(0, 3) : [];
                        let author = book.author_name ? book.author_name.slice(0,2).join(', ') : 'N/A'
                        console.log(`Title: ${book.title}, Author: ${author}, ISBNs: ${isbns.join(', ')}`);
                    });
                    console.log("----------")
                } else {
                    console.log(`** No results found for: ${titleWithoutParentheses}`);
                }
            } catch (error) {
                console.error(`Error fetching data for title ${titleWithoutParentheses}:`, error.message);
            }
        }
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    })
    .on('error', (error) => {
        console.error('Error reading CSV file:', error.message);
    });
