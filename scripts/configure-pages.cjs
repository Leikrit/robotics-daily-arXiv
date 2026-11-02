const fs = require('node:fs');
const path = require('node:path');

function configurePages(siteDir, repository) {
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repository || '')) {
    throw new Error('GITHUB_REPOSITORY must be owner/repository');
  }
  const [owner, name] = repository.split('/');
  const configPath = path.join(siteDir, 'js', 'data-config.js');
  const config = fs.readFileSync(configPath, 'utf8')
    .replace(/repoOwner: '[^']*'/, `repoOwner: '${owner}'`)
    .replace(/repoName: '[^']*'/, `repoName: '${name}'`);
  fs.writeFileSync(configPath, config);

  const repoUrl = `https://github.com/${repository}`;
  for (const file of ['index.html', 'login.html', 'settings.html', 'statistic.html']) {
    const htmlPath = path.join(siteDir, file);
    const html = fs.readFileSync(htmlPath, 'utf8')
      .replaceAll('https://github.com/Altman-conquer/robotics-daily-arXiv', repoUrl);
    fs.writeFileSync(htmlPath, html);
  }
  console.log(`Configured Pages site for ${repository}; paper data comes from its data branch.`);
}

if (require.main === module) {
  configurePages(process.argv[2] || '_site', process.env.GITHUB_REPOSITORY);
}
module.exports = { configurePages };
