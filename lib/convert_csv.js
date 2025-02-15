#!/usr/bin/env node

/*
The exported CSV file from goodreads has more fields than needed.
So before trying to align all the ISBN numbers, first want to make a simpler CSV file with only:
Title, Author, ISBN13
*/

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const inputFilePath = path.resolve("goodreads_library_export.csv");
const outputFilePath = path.resolve("my_book_list.csv");


const csvWriter = createCsvWriter({
    path: outputFilePath,
    header: [
        { id: 'title', title: 'Title' },
        { id: 'author', title: 'Author' },
        { id: 'isbn13', title: 'ISBN13' },
        { id: 'rating', title: 'Rating' }
    ]
});

const records = [];

fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
        const isbn13Field = row.ISBN13;
        const match = isbn13Field ? isbn13Field.match(/\d+/) : null; // Extract only the numeric part
        const isbn13 = match ? match[0] : '';

        records.push({
            title: row.Title.trim(),
            author: row.Author.trim(),
            isbn13: isbn13,
            rating: row['My Rating']
        });
    })
    .on('end', () => {
        csvWriter.writeRecords(records)
            .then(() => {
                console.log('Output CSV file written successfully');
            });
    })
    .on('error', (error) => {
        console.error('Error reading input CSV file:', error.message);
    });
