import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOTAL_RECORDS = 90000;

const errorRate = new Rate('errors');

// Helper function to get random limit (between 5 and 100)
function randomLimit() {
  return Math.floor(Math.random() * 96) + 5;
}

// Helper function to get random page (based on limit and total records)
function randomPage(limit) {
  const maxPage = Math.ceil(TOTAL_RECORDS / limit);
  return Math.floor(Math.random() * Math.min(maxPage, 50)) + 1; // Cap at page 50 for performance
}

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '30s', target: 50 }, // Stay at 10 users
    { duration: '30s', target: 100 }, // Ramp up to 50 users
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'], // Error rate should be less than 10%
    errors: ['rate<0.1'], // Custom error rate should be less than 10%
  },
};

/** Simulates user doing 6 different calls to the API
 *
 * 1. Search for the Beatles
 * 2. Search with category filter and random pagination
 * 3. Search with format filter and random pagination
 * 4. Search with multiple filters and random pagination
 * 5. Search orders with random pagination
 * 6. Random pagination test
 */
export default function () {
  let limit = randomLimit();
  let page = randomPage(limit);
  let response = http.get(
    `${BASE_URL}/records/search?query=Beatles&limit=${limit}&page=${page}`,
  );
  let success = check(response, {
    'records search status is 200': (r) => r.status === 200,
    'records search has results': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.results && Array.isArray(body.results);
      } catch (e) {
        return false;
      }
    },
    'records search has pagination': (r) => {
      try {
        const body = JSON.parse(r.body);
        return (
          body.totalPages !== undefined &&
          body.count !== undefined &&
          body.page !== undefined
        );
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(!success);
  sleep(1);

  // Test 2
  limit = randomLimit();
  page = randomPage(limit);
  const categories = [
    'Rock',
    'Jazz',
    'Hip-Hop',
    'Classical',
    'Pop',
    'Alternative',
    'Indie',
  ];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  response = http.get(
    `${BASE_URL}/records/search?category=${randomCategory}&limit=${limit}&page=${page}`,
  );
  success = check(response, {
    'category search status is 200': (r) => r.status === 200,
    'category search has results': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.results && Array.isArray(body.results);
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(!success);
  sleep(1);

  // Test 3
  limit = randomLimit();
  page = randomPage(limit);
  const formats = ['Vinyl', 'CD', 'Cassette', 'Digital'];
  const randomFormat = formats[Math.floor(Math.random() * formats.length)];
  response = http.get(
    `${BASE_URL}/records/search?format=${randomFormat}&limit=${limit}&page=${page}`,
  );
  success = check(response, {
    'format search status is 200': (r) => r.status === 200,
    'format search returns data': (r) => r.body.length > 0,
  });
  errorRate.add(!success);
  sleep(1);

  // Test 4
  limit = randomLimit();
  page = randomPage(limit);
  response = http.get(
    `${BASE_URL}/records/search?category=${randomCategory}&format=${randomFormat}&limit=${limit}&page=${page}`,
  );
  success = check(response, {
    'multi-filter search status is 200': (r) => r.status === 200,
  });
  errorRate.add(!success);
  sleep(1);

  // Test 5
  limit = randomLimit();
  page = randomPage(limit);
  const statuses = [
    'PENDING',
    'PREPARING',
    'CANCELLED',
    'COMPLETE',
    'SHIPPING',
  ];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  response = http.get(
    `${BASE_URL}/orders/search?status=${randomStatus}&limit=${limit}&page=${page}`,
  );
  success = check(response, {
    'orders search status is 200': (r) => r.status === 200,
    'orders search has structure': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.results !== undefined;
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(!success);
  sleep(1);

  // Test 6
  limit = randomLimit();
  page = randomPage(limit);
  response = http.get(`${BASE_URL}/records/search?limit=${limit}&page=${page}`);
  success = check(response, {
    'pagination search status is 200': (r) => r.status === 200,
    'pagination returns correct page': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.page === page;
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(!success);
  sleep(1);
}
