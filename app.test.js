const request = require('supertest');
const app = require('./index.js');
const { getProduct } = require('./getProduct');

jest.mock('./getProduct');

describe('GET /products/:product_id', () => {
    test('Query time for GET route for mocked product is below 30ms', async () => {
        const productId = Math.floor(Math.random() * 1000011) + 1;
        getProduct.mockResolvedValue({
            id: productId,
            name: 'Test Product',
            slogan: 'Test Slogan',
            description: 'Test Description',
            category: 'Test Category',
            default_price: '100',
            features: []
        });
        const startTime = process.hrtime.bigint();
        const response = await request(app).get(`/products/${productId}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(productId);
        const endTime = process.hrtime.bigint();
        const durationMs = Number((endTime - startTime) / 1000000n);
        expect(durationMs).toBeLessThan(30);
    });

    let responseTimes = [];
    for (let i = 0; i < 5; i++) {
        const productId = Math.floor(Math.random() * (1000011 - 1) + 1);
        test(`response time for (random) product_id ${productId} is less than 20ms`, async () => {
            const start = process.hrtime();
            await request(app)
                .get(`/products/${productId}`)
                .expect(200);
            const end = process.hrtime(start);
            const responseTime = end[0] * 1e9 + end[1]; 
            responseTimes.push(responseTime);
            expect(responseTime).toBeLessThan(20 * 1e6);
        });
    }

    afterAll(() => {
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        console.log(`Average response time: ${avgResponseTime / 1e6}ms`);
        expect(avgResponseTime).toBeLessThan(15 * 1e6); 
    });
});

