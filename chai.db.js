const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const { getProduct, models } = require('./getProduct');
const { Overview } = models;

// we want this variable to be accessible to multiple tests for comparison
let duration; 

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

    // (1) Connecting to the database
    it('should connect to the database successfully', async function () {
        expect(mongoose.connection.readyState).to.be.greaterThanOrEqual(1);
    });

    // (2) Verifying collection data (disabled because it is slow!)
    it('should verify the lengths of all the documents in each collection', async function () {
        this.timeout(300000); // this one takes a while
        const collections = [
            { name: 'product', model: Product },
            { name: 'features', model: Feature },
            { name: 'photos', model: Photo },
            { name: 'related', model: Related },
            { name: 'skus', model: Sku },
            { name: 'styles', model: Style },
            { name: 'overviews', model: Overview },
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

    // (3) Querying a random productID & having it return valid JSON
    it('should return valid JSON for a random productID between 1 and 999999', async function () {
        const randomId = Math.floor(Math.random() * 999999) + 1;
        const result = await getProduct(randomId);
        expect(result).to.be.an('array').with.length.above(0);
    });

    // (4) query time <= 1s
    it('should have a query time under 1000 ms', async function () {
        this.timeout(1000); 

        const randomId = Math.floor(Math.random() * 999999) + 1;
        const startTime = process.hrtime.bigint(); 
        const result = await getProduct(randomId);
        const endTime = process.hrtime.bigint(); 
        duration = Number(endTime - startTime) / 1e6; 

        expect(result).to.be.an('array').with.length.above(0);
        expect(duration).to.be.below(1000);  
    });


    // (5) querying should work on improved model 
    it('should be able to query a single document by product ID', async function () {
        const randomId = Math.floor(Math.random() * 999999) + 1;
        const result = await getOverviewProduct(randomId);
        expect(result).to.be.an('array').with.length.above(0);
    });

    // (6) query time for Overview model is better than aggregation pipeline query time
    it('query time for Overview model should be better than aggregation pipeline query', async function () {
        this.timeout(2000); 

        const randomId2 = Math.floor(Math.random() * 999999) + 1;
        const startTime2 = process.hrtime.bigint(); //  
        const result2 = await getOverviewProduct(randomId2);
        const endTime2 = process.hrtime.bigint();  
        const duration2 = Number(endTime2 - startTime2) / 1e6;  

        expect(result2).to.be.an('array').with.length.above(0);
        console.log(duration2 + 'ms <? ' + duration + 'ms ?');
        expect(duration2).to.be.below(duration);  
    });
});
