import { createWriteStream } from 'fs';
import csvParser from 'csv-parser';
import { writeToStream } from 'fast-csv';
import { convertToUpdatedObj, convertToSql } from './helpers.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, 'Export_1_1.csv');
const outputFilePath = path.join(__dirname, 'Export_1_1_with_sql.csv');

const records = [];

const readCSV = async () => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputFilePath);
    readStream
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row) => {
        const rawFilterColumn = row['raw_filter'];
        try {
          const updatedObj = convertToUpdatedObj(JSON.parse(rawFilterColumn));
          const updatedSql = convertToSql(row['id'], updatedObj);
          row['sql_sentence'] = updatedSql;
        } catch (error) {
          row['sql_sentence'] = '0';
        }      
        records.push(row);
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
  console.log('records',records );
  
  // Filtrar solo la columna sql_sentence
  const filteredRecords = records.map(record => ({ sql_sentence: record.sql_sentence }));

  return new Promise((resolve, reject) => {
    const ws = createWriteStream(outputFilePath);
    writeToStream(ws, filteredRecords, { headers: true, delimiter: ';' })
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