import { Meteor } from 'meteor/meteor';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from 'octokit';

let privateKey;
try {
  privateKey = Assets.getText('near-jobs-app.private-key.pem');
} catch (e) {
  throw new Meteor.Error(404, 'Private Key is missing! Please, add `private/near-jobs-app.private-key.pem` file');
}

/*
 * Octokit instance which acts from the name of the GitHub App
 *
 * @instanceof Octokit
 * @name appOctokit
 */
const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_GITHUB_ID,
    installationId: process.env.APP_GITHUB_INSTALLATION,
    privateKey
  }
});

export { appOctokit };
