const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://3.15.178.151:27017/tulip-overview', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const featureSchema = new Schema({
    feature: String,
    value: String,
});

const overviewSchema = new Schema({
    id: {
        type: String,
        unique: true,
    },
    name: String,
    slogan: String,
    description: String,
    category: String,
    default_price: String,
    features: [featureSchema],
}, { collection: 'overviews' });

const Overview = mongoose.model('Overview', overviewSchema);

async function getProduct(id) {
    try {
        const product = await Overview.findOne({
            $or: [
                { id: String(id) },
                { id: Number(id) },
            ],
        })
            .select('id name slogan description category default_price features -_id')
            .exec();

        if (product) {
            return product;
        } else {
            throw new Error(`Product with id ${id} not found in Overviews collection.`);
        }
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

async function getProducts(page = 1, count = 5) {
    const startId = (page - 1) * count + 1;
    const endId = startId + count;
    const ids = [];
    for (let i = startId; i < endId; i++) {
        ids.push(String(i));
    }
    try {
        const products = await Overview.find({
            id: { $in: ids }
        })
            .select('id name slogan description category default_price features -_id')
            .exec();
        if (products) {
            return products;
        } else {
            throw new Error(`No matching products found in overviews collection.`);
        }
    } catch (err) {
        console.error(`[Error]|[getProduct:${id}] ${err}`);
        throw err;
    }
}


module.exports = {
    getProduct,
    getProducts,
    models: {
        Overview
    }
};
