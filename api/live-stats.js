const { getLiveStats } = require('../lib/live-stats');

module.exports = async function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    response.status(200).json(await getLiveStats());
  } catch {
    response.status(503).json({ error: 'Live coding stats are temporarily unavailable.' });
  }
}
