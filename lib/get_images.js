const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

/*
Seems like the API is deprecated
    https://help.goodreads.com/s/article/Does-Goodreads-support-the-use-of-APIs
will need to use manual export of book list, then some other kind of API to get info about books
https://www.goodreads.com/review/import
*/

const filePath = path.resolve("goodreads_library_export.csv");
const outputDir = path.resolve("book_images");

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', async (row) => {
        const isbn13Field = row.ISBN13;
        const match = isbn13Field.match(/\d+/); // Extract only the numeric part
        const isbn13 = match ? match[0] : null;
        const title = row.Title;
        const titleWithoutParentheses = row.Title.replace(/\s*\(.*?\)\s*/g, '').trim();

        let url;
        if (isbn13) {
            url = `https://bookcover.longitood.com/bookcover/${isbn13}`;
        } else if (row.Title && row.Author) {
            const title_search = encodeURIComponent(titleWithoutParentheses);
            const author = encodeURIComponent(row.Author.trim());
            url = `https://bookcover.longitood.com/bookcover?book_title=${title_search}&author_name=${author}`;
        } else {
            console.error('Missing ISBN13 or Title/Author for row:', title);
            return;
        }

        try {
            const response = await axios.get(url);
            const imageUrl = response.data.url;
            const imagePath = path.join(outputDir, `${titleWithoutParentheses}.jpg`);

            const imageResponse = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream'
            });

            imageResponse.data.pipe(fs.createWriteStream(imagePath));
            console.log(`Image saved for ${title}`);
        } catch (error) {
            console.error(`Error fetching cover for row ${title}:`, error.message, url);
        }

        await sleep(2000); // Sleep for 2 seconds before processing the next row
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    })
    .on('error', (error) => {
        console.error('Error reading CSV file:', error.message);
    });
