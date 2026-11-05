const GITHUB_USER = 'Shubh-kumar1';
const LEETCODE_USER = 'Shubh_kumar01';
const GITHUB_CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`;
const LEETCODE_FALLBACK_URL = `https://alfa-leetcode-api.onrender.com/${LEETCODE_USER}/solved`;

const leetcodeQuery = `query userProfile($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
}`;

async function readJson(response) {
  if (!response.ok) throw new Error(`Upstream request failed: ${response.status}`);
  return response.json();
}

async function getLeetcodeSolved() {
  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://leetcode.com',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      },
      body: JSON.stringify({ query: leetcodeQuery, variables: { username: LEETCODE_USER } }),
      cache: 'no-store',
    });
    const payload = await readJson(response);
    const submissions = payload.data?.matchedUser?.submitStats?.acSubmissionNum
      ?? payload.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    const solved = submissions?.find((item) => item.difficulty === 'All')?.count;
    if (Number.isFinite(solved)) return solved;
  } catch (error) {
    console.error('LeetCode GraphQL fetch failed:', error.message);
  }

  const payload = await readJson(await fetch(LEETCODE_FALLBACK_URL, { cache: 'no-store' }));
  const solved = payload.totalSolved ?? payload.solvedProblem;
  if (!Number.isFinite(Number(solved))) throw new Error('LeetCode fallback returned an unexpected payload.');
  return Number(solved);
}

async function getLiveStats() {
  const [githubResult, leetcodeResult] = await Promise.allSettled([
    fetch(GITHUB_CONTRIBUTIONS_URL, { cache: 'no-store' }).then(readJson),
    getLeetcodeSolved(),
  ]);

  const github = githubResult.status === 'fulfilled' ? githubResult.value : null;
  const solved = leetcodeResult.status === 'fulfilled' ? leetcodeResult.value : null;
  const contributions = github
    ? Object.values(github.total || {}).reduce((total, yearTotal) => total + Number(yearTotal || 0), 0)
    : null;

  if (!Number.isFinite(contributions) && !Number.isFinite(solved)) {
    throw new Error('Unexpected live-stat payload.');
  }
  return { github: { contributions }, leetcode: { solved }, updatedAt: new Date().toISOString() };
}

module.exports = { getLiveStats };
