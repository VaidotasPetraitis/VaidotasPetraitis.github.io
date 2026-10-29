// Manual smoke check: requires an explicitly started portfolio server.
import assert from 'node:assert/strict';

const base = process.env.PORTFOLIO_SMOKE_URL ?? 'http://127.0.0.1:8080';
async function checkProjects() {
  const response = await request(`${base}/api/v1/projects`);
  assert.equal(response.status, 200);
  const projects = await response.json();
  assert.deepEqual(
    projects.map((p) => p.slug),
    ['shell-in-go', 'rutuliukai', 'quiz', 'llm-coding-assistant'],
  );
  assert.ok(!('capabilities' in projects[0]), 'list should contain summaries');
  for (const item of projects) {
    const detail = await request(`${base}/api/v1/projects/${item.slug}`).then((r) => r.json());
    assert.ok(detail.capabilities.length);
    assert.ok(detail.diagram.stages.length);
    for (const shot of detail.screenshots) {
      const image = await request(base + shot.path);
      assert.equal(image.status, 200);
      assert.match(image.headers.get('content-type'), /^image\//);
    }
  }
}
async function checkRoutes() {
  for (const path of ['/', '/?section=experience', '/?section=certifications', '/projects/quiz']) {
    const result = await request(base + path);
    assert.equal(result.status, 200);
    assert.match(result.headers.get('content-type'), /text\/html/);
  }
  const missing = await request(base + '/api/v1/projects/not-a-project');
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'project_not_found');
  assert.equal((await request(base + '/images/absent.png')).status, 404);
  const method = await request(base + '/api/v1/projects', { method: 'POST' });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('allow'), 'GET, HEAD');
}

async function request(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
}

await checkProjects();
await checkRoutes();
console.log('Portfolio manual smoke check passed.');
