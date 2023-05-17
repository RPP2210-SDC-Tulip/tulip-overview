import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 5000,
    duration: '1200s',
    rps: 2500
};

export default function () {
    const productId = Math.floor(Math.random() * (1000011 - 1) + 1);
    http.get(`http://localhost:3000/products/${productId}/related`);
    sleep(1);
}
