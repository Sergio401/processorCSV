import { createWriteStream } from "fs";
import csvParser from "csv-parser";
import { writeToStream } from "fast-csv";
import {
  processMigration,
  processValidationSNMP,
  extractEquipmentTypes,
} from "./processMigrationHelpers.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, "test.csv");
const inputpropertiesFilePath = path.join(__dirname, "properties.csv");
const outputFilePath = path.join(__dirname, "test_output.csv");

const inputhJson = path.join(__dirname, "testjson.json");
const outputJsonFilePath = path.join(__dirname, "test_output_json.json");

const records = [];
const properties = [];
const equipmentTypes = {};

const readProperties = async () => {
  return new Promise((resolve, reject) => {
    const readProperties = fs.createReadStream(inputpropertiesFilePath);
    readProperties
      .pipe(csvParser({ separator: ";" }))
      .on("data", (row) => {
        const finalProp = {
          id: row["PropertyTypes ID"],
          name: row.PropertyTypes,
        };
        properties.push(finalProp);
      })
      .on("end", () => {
        resolve(properties);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const getJSON = () => {
  const data = fs.readFileSync(inputhJson, 'utf8');
  const transformData = JSON.parse(data).data.networkGroups.edges.map(group=>group.node)
  fs.writeFileSync(outputJsonFilePath, JSON.stringify(transformData, null, 2));
  return transformData;
};

const readCSV = async () => {
  const finalProperties = await readProperties();

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputFilePath);

    readStream
      .pipe(csvParser({ separator: ";" }))
      .on("data", (row) => {
        const ids=["622770266820","622770267198"];
        const rawFilterColumn = row["rawFilter"];
        const id = row["id"];
        if(!ids.find(i=> i===id )) return;
        console.log('ids.find(i=> i===id )', ids.find(i=> i===id ));
        
        
        try {
          const parsedData =
            rawFilterColumn.charAt(rawFilterColumn.length - 1) === "]"
              ? JSON.parse(rawFilterColumn)
              : "error";
          
          
          const updatedObj = processMigration(parsedData, finalProperties);

          // delete row.raw_filter
          row["Raw_filter_final"] = JSON.stringify(updatedObj);

          updatedObj.forEach(item => {
            equipmentTypes[item] = item
          })

          records.push(row);
        } catch (error) {
          // console.log('error', row);
          records.push({ ...row });
        }
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const writeCSV = async (records) => {
  return new Promise((resolve, reject) => {
    const ws = createWriteStream(outputFilePath);
    writeToStream(ws, records, { headers: true, delimiter: ";" })
      .on("finish", () => {
        resolve("CSV processed successfully");
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

(async () => {
  try {
    // Crear nuevo csv desde un json
    // const newTest = getJSON()
    // const message = await writeCSV(newTest);
    await readCSV();
    console.log('JSON.stringify(Object.keys(equipmentTypes))', JSON.stringify(Object.keys(equipmentTypes)));

    records.push({'test': JSON.stringify(Object.keys(equipmentTypes))})
    const message = await writeCSV(records);
    console.log(message);
  } catch (error) {
    console.error("Error processing the CSV file:", error);
  }
})();
