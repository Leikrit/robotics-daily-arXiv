const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { configurePages } = require('../scripts/configure-pages.cjs');

const root = path.join(__dirname, '..');
const site = fs.mkdtempSync(path.join(os.tmpdir(), 'arxiv-pages-'));
try {
  fs.mkdirSync(path.join(site, 'js'));
  fs.copyFileSync(path.join(root, 'js/data-config.js'), path.join(site, 'js/data-config.js'));
  for (const file of ['index.html', 'login.html', 'settings.html', 'statistic.html']) {
    fs.copyFileSync(path.join(root, file), path.join(site, file));
  }
  assert.throws(() => configurePages(site, ''), /GITHUB_REPOSITORY/);
  configurePages(site, 'test-fork/robotics-daily-arXiv');
  configurePages(site, 'test-fork/robotics-daily-arXiv');
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(site, 'js/data-config.js'), 'utf8'), context);
  assert.equal(vm.runInContext('DATA_CONFIG.repoOwner', context), 'test-fork');
  assert.equal(vm.runInContext('DATA_CONFIG.getDataUrl("assets/file-list.txt")', context),
    'https://raw.githubusercontent.com/test-fork/robotics-daily-arXiv/data/assets/file-list.txt');
  for (const file of ['index.html', 'settings.html', 'statistic.html']) {
    const html = fs.readFileSync(path.join(site, file), 'utf8');
    assert.ok(html.includes('https://github.com/test-fork/robotics-daily-arXiv'));
    assert.ok(!html.includes('https://github.com/Altman-conquer/robotics-daily-arXiv'));
    const script = { 'index.html': 'app.js', 'settings.html': 'settings.js', 'statistic.html': 'statistic.js' }[file];
    assert.ok(html.includes('js/data-config.js'));
    assert.ok(html.indexOf('js/data-config.js') < html.indexOf(`js/${script}`));
  }
  console.log('Pages fork configuration tests passed.');
} finally {
  fs.rmSync(site, { recursive: true, force: true });
}
