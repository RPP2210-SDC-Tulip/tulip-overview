const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost/tulip-overview', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const relatedSchema = new Schema({}, { strict: false, collection: 'related' });
relatedSchema.index({ id: 1 });
const Related = mongoose.model('Related', relatedSchema);

async function getRelated(id) {
    try {
        const startTime = process.hrtime();
        const relatedProducts = await Related.find({ current_product_id: String(id) });
        const relatedProductIds = relatedProducts.map((product) => parseInt(product.related_product_id));
        const endTime = process.hrtime(startTime);
        const duration = (endTime[0] * 1e9 + endTime[1]) / 1e6;
        console.log(`[getRelated:${id}]: ${duration} ms | [${relatedProductIds}]`);
        return relatedProductIds;
    } catch (err) {
        console.error(`> Error [getRelated:${id}] ${err}`);
    }
}

module.exports = {
    getRelated,
};