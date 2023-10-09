import { parentPort, workerData } from "worker_threads";
const countWords = (arrayOfWords) => {
  const wordCount = {};
  arrayOfWords.forEach((item) => {
    if (item) {
      if (wordCount?.[item]) {
        wordCount[item.toString()] = wordCount[item] + 1;
      } else {
        wordCount[item.toString()] = 1;
      }
    }
  });
  return wordCount;
};

const wordCount = countWords(workerData);
parentPort?.postMessage(wordCount);
