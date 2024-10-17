import { createWriteStream } from 'fs';
import csvParser from 'csv-parser';
import { writeToStream } from 'fast-csv';
import { processMigration } from './processMigrationHelpers.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { log } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, 'test.csv');
const inputpropertiesFilePath = path.join(__dirname, 'properties.csv');
const outputFilePath = path.join(__dirname, 'test_output.csv');

const records = [];
const properties = [];

 const readProperties = async () => {
  return new Promise((resolve, reject) => {
    const readProperties = fs.createReadStream(inputpropertiesFilePath);
    readProperties
    .pipe(csvParser({ separator: ';' }))
    .on('data', (row) => {
      const finalProp = {id: row['PropertyTypes ID'], name:row.PropertyTypes }
      properties.push(finalProp)
    })
      .on('end', () => {
        resolve(properties);
      })
      .on('error', (error) => {
        reject(error);
      });
  });

 }
const readCSV = async () => {
 
  const finalProperties = await readProperties()
  
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputFilePath);
    readStream
      .pipe(csvParser({ separator: ';' }))
      .on('data', (row) => {
          const rawFilterColumn = row['raw_filter'];
          row['is_snmp']='Error'
          try {
              const parsedData = rawFilterColumn.charAt(rawFilterColumn.length - 1) === ']'? JSON.parse(rawFilterColumn) : 'error'
              const updatedObj = processMigration(parsedData, finalProperties);
              row['is_snmp'] = JSON.stringify(updatedObj);
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