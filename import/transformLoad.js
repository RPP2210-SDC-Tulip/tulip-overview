const mongoose = require('mongoose');
const getProduct = require('./getProduct').getProduct;

mongoose.connect('mongodb://localhost/tulip-overview', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const totalProducts = 1000012; 
const batchSize = 50; 

const overviewSchema = new mongoose.Schema({}, { strict: false, collection: 'overviews' });
overviewSchema.index({ id: 1 }, { unique: true });
const Overview = mongoose.model('Overview', overviewSchema);

async function processBatch(start, end) {
  for (let i = start; i < end; i++) {
    try {
      const productData = await getProduct(i);
      if (productData && productData.length > 0) {
        const overview = new Overview(productData[0]);
        await overview.save();
        console.log(`Processed product ID: ${i}`);
      } else {
        console.log(`No data found for product ID: ${i}`);
      }
    } catch (err) {
      console.error(`Error processing product ID ${i}:`, err);
    }
  }
}

(async () => {
  for (let i = 0; i < totalProducts; i += batchSize) {
    await processBatch(i, i + batchSize);
  }
  mongoose.connection.close();
  console.log('Finished processing all products');
})();
