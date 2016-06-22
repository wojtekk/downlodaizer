const shell = require('shelljs');

class Git {
  constructor(opts) {
    this.baseDir = opts.directory;
    this.gitUrl = opts.url;
    this.skipCleanup = opts.skipCleanup || false;
    this.depth = opts.depth || 1000;
  }

  checkout(repository) {
    const repoDirName = repository.replace('/', '-');
    const directory = `${this.baseDir}${repoDirName}/`;
    if (!shell.test('-d', directory)) {
      shell.mkdir('-p', directory);
      const repoUrl = `${this.gitUrl}${repository}.git`;
      console.info(`Cloning repository ${repository}`);
      const res = shell.exec(`git clone ${repoUrl} ${directory}`, { silent: true });
      return res.code === 0;
    }
    return true;
  }

  log(since, until, userDetails, repository) {
    console.info(`Generating diff for user: ${userDetails.name}, repository: ${repository}`);
    const repoDirName = repository.replace('/', '-');
    const directory = `${this.baseDir}${repoDirName}/`;
    const userName = `--author="${userDetails.name}"`;
    const emails = userDetails.emails.map(email => `--author="${email}"`).join(' ');
    const sinceParam = `--since "${since}"`;
    const untilParam = `--until "${until}"`;
    const depthParam = `--depth "${this.depth}"`;
    const logOptions = '--patch --ignore-all-space --ignore-space-at-eol --no-color --summary';
    const options = `-c core.pager=cat -C "${directory}"`;
    const command = `git ${options} log ${sinceParam} ${untilParam} ` +
      `${userName} ${emails} ${depthParam} ${logOptions}`;
    const res = shell.exec(command, { silent: true });

    return res.stdout;
  }

  cleanUp() {
    if (!this.skipCleanup) {
      shell.rm('-rf', this.baseDir);
    }
  }
}

module.exports = Git;
