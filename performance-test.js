import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";


// Configuración de las opciones de la prueba
export let options = {
    stages: [
        { duration: '30s', target: 10 },  // 10 usuarios durante 30 segundos
        { duration: '1m', target: 20 },   // 20 usuarios durante 1 minuto
        { duration: '30s', target: 0 }    // Reducción de usuarios a 0 durante 30 segundos
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // El 95% de las solicitudes deben durar menos de 500 ms
        'http_req_waiting': ['p(95)<400'],  // El 95% del tiempo de espera debe ser menor de 400 ms
        'http_req_connecting': ['p(95)<50'], // El 95% del tiempo de conexión debe ser menor de 50 ms
        'http_req_sending': ['p(95)<50'],    // El 95% del tiempo de envío debe ser menor de 50 ms
        'http_req_receiving': ['p(95)<100'], // El 95% del tiempo de recepción debe ser menor de 100 ms
    },
};

// Lógica de la prueba
export default function () {
    // Prueba de método POST para agregar un nuevo pet
    let addPetResponse = http.post('http://localhost:8080/api/v3/pet', JSON.stringify({
        id: 101,
        name: 'Chicano',
        category: {
            id: 1,
            name: 'Dog'
        },
        photoUrls: ['http://example.com/photo.jpg'],
        tags: [{ id: 1, name: 'friendly' }],
        status: 'available'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(addPetResponse, {
        'POST /pet status is 200': (r) => r.status === 200,
        'POST /pet response time is under 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1); // Espera de 1 segundo entre las solicitudes

  // Prueba de método GET para encontrar un pet por ID
  let getPetResponse = http.get('http://localhost:8080/api/v3/pet/101');
  check(getPetResponse, {
      'GET /pet/101 status is 200': (r) => r.status === 200,
      'GET /pet/101 response time is under 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Espera de 1 segundo entre las solicitudes


  // Prueba de método GET para obtener el inventario de la tienda
  let getInventoryResponse = http.get('http://localhost:8080/api/v3/store/inventory');
  check(getInventoryResponse, {
      'GET /store/inventory status is 200': (r) => r.status === 200,
      'GET /store/inventory response time is under 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Espera de 1 segundo entre las solicitudes


  // Prueba de método POST para realizar un pedido
    let placeOrderResponse = http.post('http://localhost:8080/api/v3/store/order', JSON.stringify({
        id: 202,
        petId: 101,
        quantity: 1,
        shipDate: new Date().toISOString(),
        status: 'placed',
        complete: false
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(placeOrderResponse, {
        'POST /store/order status is 200': (r) => r.status === 200,
        'POST /store/order response time is under 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1); // Espera de 1 segundo entre las solicitudes

    
}
export function handleSummary(data) {
    return {
      "result.html": htmlReport(data),
      stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}