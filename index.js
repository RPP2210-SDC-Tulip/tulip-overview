const express = require('express');
const app = express();
const port = 3000;
const { getProduct, getProducts } = require('./getProduct');
const { getStyles } = require('./getStyles');
const { getRelated } = require('./getRelated');

app.use(express.json());

app.get('/products/:product_id/styles', async (req, res) => {
    const id = parseInt(req.params.product_id);
    try {
        const startTime = process.hrtime.bigint();
        const styles = await getStyles(id);
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1e6;
        console.log('[getStyles]: ' + duration + ' ms');
        res.status(200).json(styles);
    } catch (err) {
        console.error('Error:', err);

        if (err.message.includes('not found')) {
            res.status(404).json({ error: `Product with id ${id} not found.` });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching the styles data.' });
        }
    }
});

app.get('/products/:product_id/related', async (req, res) => {
    const id = parseInt(req.params.product_id);
    try {
        const related = await getRelated(id);
        res.status(200).json(related);
    } catch (err) {
        console.error('Error:', err);
        if (err.message.includes('not found')) {
            res.status(404).json({ error: `Product with id ${id} not found.` });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching the related data.' });
        }
    }
});

app.get('/products/:product_id', async (req, res) => {
    try {
        const id = parseInt(req.params.product_id);
        const product = await getProduct(id);
        res.status(200).json(product);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'An error occurred while fetching the product data.' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const count = parseInt(req.query.count) || 5;
        const products = await getProducts(page, count);
        res.status(200).json(products);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const server = app.listen(port, () => {
    console.log(`Tulip-Overview server is running on port ${port}`);
});

module.exports = server;