const Octokat = require('octokat');

const octo = new Octokat({
  token: process.env.GITHUB_TOKEN,
  rootURL: process.env.GITHUB_API_URL,
});


function getModifiedRepos(events, since, until) {
  const repos = events.filter(event => {
      const eventCreateData = new Date(event.createdAt);
      return event.type === 'PushEvent' &&
        eventCreateData >= since &&
        eventCreateData <= until;
    })
    .map(event => event.repo.name);
  const uniqRepos = [...new Set(repos)];

  return uniqRepos;
}

function getUserRepositories(user, since, until) {
  return octo.users(user).events.fetch()
    .then(res => Object.assign({},
      {name: user, repositories: getModifiedRepos(res.items, since, until)})
    )
    .catch(err => {
      console.error(err);
    });
}

module.exports = {
  getUserRepositories
};
