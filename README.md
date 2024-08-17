# Goodible

A tool that will parse your Audible library, and let you sync the content with your Goodreads account.

## Usage

Your Audible username/password are required, as well as the Goodreads account (token?).
This data is only used once and not saved. If an error occurs or you need to start over, you'll need to provide it again.

## Pending implementation

* ssl configuration


## Installation

```
npm install
```

## steps to get images

1. export a csv file from goodreads
    - check the past export file `goodreads_library_export.csv` and compare the format
2. run `node lib/convert_csv.js` to simplify the export
2. run `node lib/get_isbns.js` to get as many ISBNs from the list as possible
    - merge with `my_book_list_2024.csv` for the past books _(those ISBNs have already been vetted)_
3. run `node lib/get_images.js` to download to /book_images
    - ideally want to collect images that are 150kb or larger
    - for images that don't align, can use:
        - https://openlibrary.org/dev/docs/api/search
        - or even just https://www.goodreads.com/search to look for the ISBN 13

