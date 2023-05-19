import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 5000,
    duration: '30s',
    rps: 2700
};

export default function () {
    // changing endpoint below should be all you need to test a different route
    const selected = 'getProducts'; 
    const apiUrl = 'http://localhost:3000/';
    const ranges = {
        products: 1000011,  // total records in db
        pages: 200002,      // (total records / 5) [should lower this if count > 5]
    };
    const random = {
        product: Math.floor(Math.random() * (ranges.products - 1) + 1),
        page: Math.floor(Math.random() * (ranges.pages - 1) + 1),
    };
    const endpoints = {
        getProduct: () => `${apiUrl}products/${random.product}`,
        getProducts: () => `${apiUrl}products?page=${random.page}`,
        getStyles: () => `${apiUrl}products/${random.product}/styles`,
        getRelated: () => `${apiUrl}products/${random.product}/related`,
    };
    http.get(endpoints[selected]());
    sleep(1);

}