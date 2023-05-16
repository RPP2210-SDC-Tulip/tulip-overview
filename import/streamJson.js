const fs = require('fs');
const { chain } = require('stream-chain');
const { parser } = require('stream-json/Parser');
const { streamArray } = require('stream-json/streamers/StreamArray');

const files = ['features', 'photos', 'product', 'related', 'skus', 'styles'];

files.forEach((file) => {
  console.log('stream: ' + file);
  const inputFile = `${file}.json`;
  const outputFile = `${file}_new2.json`;

  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  const pipeline = chain([
    readStream,
    parser(),
    streamArray(),
    data => {
      if (data && typeof data.value === 'object') {
        return JSON.stringify(data.value) + '\n';
      }
    },
    writeStream
  ]);

  pipeline.on('error', (error) => {
    console.error(`Error processing file (${inputFile}): ${error}`);
  });

  pipeline.on('finish', () => {
    console.log(`JSON file converted successfully: ${outputFile}`);
  });
});
