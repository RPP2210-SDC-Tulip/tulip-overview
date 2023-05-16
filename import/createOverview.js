const mongoose = require('mongoose');
const { getProduct/**, models*/ } = require('./getProduct');
// const { Product } = models;

mongoose.connect('mongodb://localhost/tulip-overview', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const overviewSchema = new mongoose.Schema({}, { strict: false, collection: 'overviews' });
// todo add an actual schema lol
overviewSchema.index({ id: 1 }, { unique: true });
const Overview = mongoose.model('Overview', overviewSchema);

async function createOverviewCollection() {
  try {
    // const count = await Product.countDocuments().exec();
    const count = 1000012; 
    console.log('Total products:', count);

    for (let i = 1; i <= count; i++) {
      console.log('Processing product:', i);
      const result = await getProduct(i);

      if (result && result.length > 0) {
        const { id } = result[0];
        await Overview.updateOne(
          { id },
          { $set: result[0] },
          { upsert: true }
        ).exec();
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
    console.log('Overview collection created.');
  }
}

createOverviewCollection();
