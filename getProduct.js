const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost/tulip-overview', {
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
    // Product Information by product_id
    const startTime = process.hrtime();
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
            const endTime = process.hrtime(startTime);
            const duration = (endTime[0] * 1e9 + endTime[1]) / 1e6;
            console.log(`${duration} ms [getProduct:${id}]`);
            return product;
        } else {
            throw new Error(`Product with id ${id} not found in overviews collection.`);
        }
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

async function getProducts(page = 1, count = 5) {
    const skip = (page - 1) * count;
    try {
        const products = await Overview.find()
            .skip(skip)
            .limit(count)
            .select('id name slogan description category default_price features -_id')
            .exec();

        if (products) {
            return products;
        } else {
            throw new Error(`No products found in overviews collection.`);
        }
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

module.exports = {
    getProduct,
    getProducts,
};
