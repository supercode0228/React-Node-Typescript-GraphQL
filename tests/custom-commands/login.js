const deploymentType = process.env.DEPLOYMENT_TYPE || 'local';
const RootUri = {
  'local': 'http://localhost:3000',
  'dev': 'https://staging.Tests.com',
  'master': 'https://app.Tests.com',
}[deploymentType];

exports.command = function (username, password) {
  return this
    .url(`${RootUri}/login`)
    .waitForElementVisible('input[type=email]', 5000)
    .setValue('input[type=email]', username)
    .setValue('input[type=password]', password)
    .click('input[type=submit]')
    .waitForElementVisible('nav.logged-in', 5000)
    .url(url => this.assert.ok(url.value.endsWith('/dashboard'), 'Logged in'));
};
