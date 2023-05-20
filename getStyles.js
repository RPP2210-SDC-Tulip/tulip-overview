const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost/tulip-overview', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const skusSchema = new Schema({}, { strict: false, collection: 'skus' });
skusSchema.index({ styleId: 1 });
const Sku = mongoose.model('Sku', skusSchema);

const stylesSchema = new Schema({}, { strict: false, collection: 'styles' });
stylesSchema.index({ productId: 1 });
const Style = mongoose.model('Style', stylesSchema);

const photosSchema = new Schema({}, { strict: false, collection: 'photos' });
photosSchema.index({ styleId: 1 });
const Photo = mongoose.model('Photo', photosSchema);

const fashionSchema = new Schema({
    product_id: Number,
    results: [
        {
            name: String,
            original_price: String,
            style_id: Number,
            sale_price: String,
            default: Boolean,
            photos: [
                {
                    thumbnail_url: String,
                    url: String,
                },
            ],
            skus: Object,
        },
    ],
});

const Fashion = mongoose.model('Fashion', fashionSchema);

async function getFashion(id) {
    try {
        const fashion = await Fashion.findOne({
            $or: [
                { product_id: String(id) },
                { product_id: Number(id) },
            ],
        })
            .select('product_id results -_id')
            .exec();

        if (fashion) {
            console.log(fashion);
            return fashion;
        } else {
            throw new Error(`Style with product_id ${id} not found in Fashions collection, which happens sometimes.`);
        }
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}


async function getStyles(id) {
    try {
        const styles = await Style.aggregate([
            {
                $match: {
                    productId: String(id),
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'id',
                    foreignField: 'styleId',
                    as: 'skus',
                },
            },
            {
                $lookup: {
                    from: 'photos',
                    localField: 'id',
                    foreignField: 'styleId',
                    as: 'photos',
                },
            },
            {
                $project: {
                    _id: 0,
                    style_id: "$id",
                    name: 1,
                    original_price: 1,
                    sale_price: {
                        $cond: { if: { $eq: ["$sale_price", "null"] }, then: "0", else: "$sale_price" }
                    },
                    "default?": {
                        $cond: { if: { $eq: ["$default_style", "1"] }, then: true, else: false }
                    },
                    photos: {
                        $map: {
                            input: "$photos",
                            as: "photo",
                            in: {
                                thumbnail_url: "$$photo.thumbnail_url",
                                url: "$$photo.url"
                            },
                        },
                    },
                    skus: {
                        $arrayToObject: {
                            $map: {
                                input: "$skus",
                                as: "sku",
                                in: [{ $toString: "$$sku.id" }, { quantity: "$$sku.quantity", size: "$$sku.size" }],
                            },
                        },
                    },
                },
            },
        ]);
        if (styles.length > 0) {
            console.log({ product_id: id, results: styles });
            return { product_id: id, results: styles };
        } else {
            console.error(`No styles data found for product id: ${id}`);
            throw new Error(`Style with id ${id} not found.`);
        }
    } catch (err) {
        console.error(`[Error]|[getStyles:${id}] ${err}`);
        throw err;
    }
}

module.exports = {
    getFashion,
    getStyles,
    models: {
        Fashion,
        Photo,
        Sku,
        Style
    }
};