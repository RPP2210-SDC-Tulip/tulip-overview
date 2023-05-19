const { describe, it, before, after } = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const { getProduct, getProducts, models: { Overview } } = require('./getProduct');
const { getStyles, models: { Photo, Sku, Style } } = require('./getStyles');
const { getRelated, models: { Related } } = require('./getRelated');

/** config variables -- edit as needed */ 
let performanceTests = 100000;         // Probably don't want to exceed 100k
let tolerance = {                      // Set your performance threshholds 
    best: 0.1,
    worst: 1000,
    average: 10,
};
let decimalPlaces = 5;                 // How many decimal places to report timestamps
let measurements = {                   // Include functions here in order of execution
    _1__getProduct: [],
    _2_getProducts: [],
    _3___getStyles: [],
    _4__getRelated: [],
};

/** globals */                         // no need to edit these 
let totalRoutes = Object.keys(measurements).length;
let duration;
let queryTimes = {};
let totalDuration = 0;

describe('Database tests', function () {
    before(async function () {
        await mongoose.connect('mongodb://localhost/tulip-overview', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    after(async function () {
        await mongoose.connection.close();
    });

    it('should connect to the database successfully', async function () {
        expect(mongoose.connection.readyState).to.be.greaterThanOrEqual(1);
    });

    xit('should verify the lengths of all the documents in each collection', async function () {
        this.timeout(300000);
        const collections = [
            { name: 'overviews', model: Overview },
            { name: 'photos', model: Photo },
            { name: 'skus', model: Sku },
            { name: 'styles', model: Style },
            { name: 'related', model: Related },
        ];

        const startAudit = process.hrtime.bigint();

        for (const collection of collections) {
            const count = await collection.model.countDocuments();
            console.log(`Count for ${collection.name}:`, count);
            expect(count).to.be.a('number');
        }

        const endAudit = process.hrtime.bigint();
        const audit = Number(endAudit - startAudit) / 1e6;
        console.log(`Audited ${collections.length} collections in ${audit} ms`);
    });

    it(`should return valid JSON for each of the ${totalRoutes} routes`, async function () {

        const randomId = Math.floor(Math.random() * 999999) + 1;
        const result = await getProduct(randomId);
        expect(result).to.be.an('object');
        expect(Object.keys(result)).to.have.length.above(0);

        const randomId2 = Math.floor(Math.random() * 333333) + 1;
        const result2 = await getProducts(randomId2, 3);
        expect(result2).to.be.an('array');
        expect(result2).to.have.length.above(0);

        const min3 = Math.ceil(233330);
        const max3 = Math.floor(233378);
        const randomId3 = Math.floor(Math.random() * (max3 - min3 + 1)) + min3;
        const result3 = await getStyles(randomId3);
        expect(result3).to.be.an('object');
        expect(result3).to.have.property('product_id').that.is.a('number');
        expect(result3).to.have.property('results').that.is.an('array');
        expect(result3.results).to.have.length.above(0);

        const randomId4 = Math.floor(Math.random() * 999999) + 1;
        const result4 = await getRelated(randomId4);
        expect(result4).to.be.an('array');
        expect(Object.keys(result4)).to.have.length.above(0);
    });

    describe(`Function (ms)| average | ↑slowest | ↓best  [${performanceTests} tests x ${totalRoutes} fns]`, function () {
        this.timeout(10 * performanceTests * totalRoutes);
        it(`should measure and validate the performance of ${totalRoutes} tests x ${performanceTests} iterations per function`, async function () {
            for (let i = 1; i <= performanceTests; i++) {
                const randomId1 = Math.floor(Math.random() * 999999) + 1;
                const startTime1 = process.hrtime.bigint();
                const result1 = await getProduct(randomId1);
                const endTime1 = process.hrtime.bigint();
                const duration1 = Number(endTime1 - startTime1) / 1e6;
                measurements._1__getProduct.push(duration1);

                const randomId2 = Math.floor(Math.random() * 333333) + 1;
                const startTime2 = process.hrtime.bigint();
                const result2 = await getProducts(randomId2, 3);
                const endTime2 = process.hrtime.bigint();
                const duration2 = Number(endTime2 - startTime2) / 1e6;
                measurements._2_getProducts.push(duration2);

                const min3 = Math.ceil(233330);
                const max3 = Math.floor(233378);
                const randomId3 = Math.floor(Math.random() * (max3 - min3 + 1)) + min3;
                const startTime3 = process.hrtime.bigint();
                const result3 = await getStyles(randomId3);
                const endTime3 = process.hrtime.bigint();
                const duration3 = Number(endTime3 - startTime3) / 1e6;
                measurements._3___getStyles.push(duration3);

                const randomId4 = Math.floor(Math.random() * 999999) + 1;
                const startTime4 = process.hrtime.bigint();
                const result4 = await getRelated(randomId4);
                const endTime4 = process.hrtime.bigint();
                const duration4 = Number(endTime4 - startTime4) / 1e6;
                measurements._4__getRelated.push(duration4);
            }

            let stats = {};

            for (let [key, values] of Object.entries(measurements)) {
                let min = Math.min(...values);
                let max = Math.max(...values);
                let avg = values.reduce((a, b) => a + b, 0) / values.length;

                stats[key] = {
                    min: min.toFixed(decimalPlaces),
                    max: max.toFixed(decimalPlaces),
                    avg: avg.toFixed(decimalPlaces)
                };
            }

            for (let [key, values] of Object.entries(stats)) {
                let min = parseFloat(values.min);
                let max = parseFloat(values.max);
                let avg = parseFloat(values.avg);

                console.log(` * ${key}: ${avg} | ${max} | ${min} `);

                expect(min).to.be.at.least(tolerance.best);
                expect(max).to.be.at.most(tolerance.worst);
                expect(avg).to.be.at.most(tolerance.average);
            }
        });
    });
});