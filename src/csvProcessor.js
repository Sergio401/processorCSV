import { createWriteStream } from 'fs';
import csvParser from 'csv-parser';
import { writeToStream } from 'fast-csv';
import { processMigration } from './processMigrationHelpers.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, 'test.csv');
const outputFilePath = path.join(__dirname, 'test_output.csv');

const records = [];

const readCSV = async () => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputFilePath);
    readStream
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row) => {
        const rawFilterColumn = row['raw_filter'];
        row['raw_filter_updated']='Error'
        try {
            const parsedData = rawFilterColumn.charAt(rawFilterColumn.length - 1) === ']'? JSON.parse(rawFilterColumn) : 'error'
            const updatedObj = processMigration(parsedData);
            row['raw_filter_updated'] = JSON.stringify(updatedObj);
            records.push(row);
        } catch (error) {
          console.log('error', row);
          records.push({...row});
        }      
        
      })
      .on('end', () => {
        resolve(records);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const writeCSV = async (records) => {
  return new Promise((resolve, reject) => {
    const ws = createWriteStream(outputFilePath);
    writeToStream(ws, records, { headers: true, delimiter: ';' })
      .on('finish', () => {
        resolve('CSV processed successfully');
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

(async () => {
  try {
    await readCSV();
    const message = await writeCSV(records);
    console.log(message);
  } catch (error) {
    console.error('Error processing the CSV file:', error);
  }
})();