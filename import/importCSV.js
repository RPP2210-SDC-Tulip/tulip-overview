const fs = require('fs');
const readline = require('readline');
const inputFiles = ['features', 'photos', 'product', 'related', 'skus', 'styles'];

inputFiles.forEach((fileName) => {
  const inputFile = fileName + '.json';
  const outputFile = fileName + '_new.Json';

  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading the JSON file (${inputFile}):`, err);
      return;
    }

    try {
      const jsonArray = JSON.parse(data);
      const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });
      const rl = readline.createInterface({ input: fs.createReadStream(inputFile), output: writeStream });

      rl.on('line', (line) => {
        try {
          const jsonObject = JSON.parse(line);
          writeStream.write(JSON.stringify(jsonObject) + '\n');
        } catch (error) {
          console.error(`Error parsing JSON line in file (${inputFile}):`, error);
        }
      });

      rl.on('close', () => {
        console.log('JSON lines file created successfully:', outputFile);
      });
    } catch (error) {
      console.error(`Error parsing the JSON file (${inputFile}):`, error);
    }
  });
});
