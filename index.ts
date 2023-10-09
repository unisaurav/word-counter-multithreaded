import { promises as fs } from "fs";
import { Worker } from "worker_threads";
const threads = 4;
type GenericObject = { [key: string]: number };

const readFile = async (fileName: string): Promise<string | any> => {
  try {
    const fileString: string = await fs.readFile(fileName, {
      encoding: "utf8",
    });
    return fileString;
  } catch (err) {
    return err;
  }
};
const streamToArray = (readableStream: string): Array<string> => {
  return readableStream
    .toLowerCase()
    .replace(/[.,\/#"'?!$%\^&\*;:{}=\_`~()<>]/g, "")
    .split(/\s+/);
};

const mergeObjects = (
  obj1: GenericObject,
  obj2: GenericObject
): GenericObject => {
  const result: GenericObject = {};
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      result[key] = obj1[key];
    }
  }

  for (const key in obj2) {
    if (result.hasOwnProperty(key)) {
      result[key] += obj2[key];
    } else {
      result[key] = obj2[key];
    }
  }

  return result;
};

const mainFunction = () => {
  if (process.argv.length !== 3) { //args check 
    console.log("Format Should be => ts-node index.ts texfile.txt");
  } else {
    const mystring = readFile(process.argv[2])
      .then((data: string) => {
        const allWords = streamToArray(data); //string to array of words....
        const parts = Math.ceil(allWords.length / threads); // Can change the count of threads running....
        let threadArray: Array<Array<string>> = [];
        for (let i = 0; i < threads; i++) {
          threads - 1 === i
            ? (threadArray = [...threadArray, allWords])
            : (threadArray = [...threadArray, allWords.splice(-parts)]);
        }
        const resultArray: Array<string> = [];
        let resultObject: GenericObject = {};
        let counter = 0;
        threadArray.forEach((arrayOfWords: Array<string>) => {
          const threadWorkers = new Worker("./worker.mjs", {
            workerData: arrayOfWords,
          });
          threadWorkers.on("message", (message) => {
            resultArray.push(message);
            resultObject = mergeObjects(resultObject, message);
            counter++;
            if (threadArray.length === counter) {
              console.log(resultObject); // Output
            }
          });
        });
      })
      .catch((err) => {
        console.log("Not a valid file ...", err);
      });
  }
};
mainFunction();
