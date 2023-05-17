import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 1000,
    duration: '120s',
    rps: 900
};

export default function () {
    const productId = Math.floor(Math.random() * (1000011 - 1) + 1);
    http.get(`http://localhost:3000/products/${productId}`);
    sleep(1);
}
