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
    const repoUrl = `${this.gitUrl}${repository}.git`;
    let res;
    if (!shell.test('-d', directory)) {
      shell.mkdir('-p', directory);
      console.info(`Cloning repository ${repository}`);
      res = shell.exec(`git clone ${repoUrl} ${directory}`, { silent: true });
    } else {
      console.info(`Pulling repository ${repository}`);
      res = shell.exec(`git -C ${directory} pull ${repoUrl}`, { silent: true });
    }
    if (res.code) {
      console.error('Error during git command:\n', res.stderr);
    }
    return res.code === 0;
  }

  log(since, until, userDetails, repository) {
    console.info(`Generating diff for user: ${userDetails.name}, repository: ${repository}`);
    const repoDirName = repository.replace('/', '-');
    const directory = `${this.baseDir}${repoDirName}/`;
    const userName = `--author="${userDetails.name}"`;
    const emails = userDetails.emails.map(email => `--author="${email}"`).join(' ');
    const sinceParam = `--since "${since}"`;
    const untilParam = `--until "${until}"`;
    const logOptions = '--patch --ignore-all-space ' +
      '--ignore-space-at-eol --no-color ' +
      '--summary --all --no-merges';
    const options = `-c core.pager=cat -C "${directory}"`;
    const command = `git ${options} log ${sinceParam} ${untilParam} ` +
        `${userName} ${emails} ${logOptions}`;
    const res = shell.exec(command, { silent: true });
    if (res.code) {
      console.error('Error during git log:\n', res.stderr);
    }

    if (res.code !== 0 || res.stdout.length === 0) {
      console.error(`Empty during git log for repository: ${repository}\n`, res.stderr);
    }

    return res.stdout;
  }

  cleanUp() {
    if (!this.skipCleanup) {
      shell.rm('-rf', this.baseDir);
    }
  }
}

module.exports = Git;
