const GITHUB_USER = 'Shubh-kumar1';
const LEETCODE_USER = 'Shubh_kumar01';
const GITHUB_CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`;

const leetcodeQuery = `query userProfile($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
}`;

async function readJson(response) {
  if (!response.ok) throw new Error(`Upstream request failed: ${response.status}`);
  return response.json();
}

async function getLiveStats() {
  const [github, leetcode] = await Promise.all([
    fetch(GITHUB_CONTRIBUTIONS_URL, { cache: 'no-store' }).then(readJson),
    fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: leetcodeQuery, variables: { username: LEETCODE_USER } }),
    }).then(readJson),
  ]);
  const contributions = Object.values(github.total || {}).reduce((total, yearTotal) => total + Number(yearTotal || 0), 0);
  const solved = leetcode.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum?.find((item) => item.difficulty === 'All')?.count;
  if (!Number.isFinite(contributions) || !Number.isFinite(solved)) throw new Error('Unexpected live-stat payload.');
  return { github: { contributions }, leetcode: { solved }, updatedAt: new Date().toISOString() };
}

module.exports = { getLiveStats };
