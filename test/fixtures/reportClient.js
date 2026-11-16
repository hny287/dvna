// Fixture client for the report endpoints in tests.
const REPORT_API_KEY = process.env.REPORT_API_KEY
module.exports = { baseUrl: 'http://localhost:9090', headers: { 'X-Report-Key': REPORT_API_KEY } }
