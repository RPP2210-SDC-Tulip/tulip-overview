const express = require('express');
const app = express();
const port = 3000;
const { getProduct, getProducts } = require('./getProduct'); 

app.use(express.json());

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
        console.error('Error:', err);
        res.status(500).json({ error: 'An error occurred while fetching the products data.' });
    }
});


const server = app.listen(port, () => {
    console.log(`Tulip-Overview server is running on port ${port}`);
});

module.exports = server;