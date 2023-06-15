const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://18.188.128.249:27017/tulip-overview', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const relatedSchema = new Schema({}, { strict: false, collection: 'related' });
relatedSchema.index({ id: 1, unique: true });
const Related = mongoose.model('Related', relatedSchema);


async function getRelated(id) {
    try {
        const relatedProducts = await Related.find({ current_product_id: String(id) });
        const relatedProductIds = relatedProducts.map((product) => parseInt(product.related_product_id));
        return relatedProductIds;
    } catch (err) {
        console.error(`[Error]|[[getRelated:${id}] ${err}`);
    }
}

module.exports = {
    getRelated,
    models: {
        Related
    }
};