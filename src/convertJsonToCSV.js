import { createWriteStream } from "fs";
import { readFile } from "fs";
import csvParser from "csv-parser";
import { writeToStream } from "fast-csv";
import {
  processMigration,
  processValidationSNMP,
} from "./processMigrationHelpers.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, "NEInput.json");
const outputFilePath = path.join(__dirname, "allNEOutput.csv");

const readCSV = () => {
  return new Promise((resolve, reject) => {
    try {
      readFile(inputFilePath, (error, data) => {
        if (error) {
          console.log(error);
          return;
        }
        const parsedData = JSON.parse(data);
        const nodes = parsedData.data.networkGroups.edges.map((node) => node.node);
        resolve(nodes);
      });
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
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
    const nodes = await readCSV();
    const message = await writeCSV(nodes);
    console.log(message);
  } catch (error) {
    console.error("Error processing the CSV file:", error);
  }
})();
