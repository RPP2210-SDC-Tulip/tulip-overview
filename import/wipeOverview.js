const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tulip-overview', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const overviewSchema = new mongoose.Schema({}, { strict: false, collection: 'overviews' });
const Overview = mongoose.model('Overview', overviewSchema);

async function deleteAllOverviews() {
  try {
    await Overview.deleteMany({}).exec();
    console.log('All documents in the Overview collection have been deleted.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

deleteAllOverviews();
