import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';

ServiceConfiguration.configurations.remove({});

if (process.env.ACCOUNTS_GITHUB_ID && process.env.ACCOUNTS_GITHUB_SEC) {
  ServiceConfiguration.configurations.upsert({
    service: 'github'
  }, {
    $set: {
      secret: process.env.ACCOUNTS_GITHUB_SEC,
      clientId: process.env.ACCOUNTS_GITHUB_ID,
      loginStyle: 'popup'
    }
  });
} else {
  throw new Meteor.Error(500, 'Environment variables `ACCOUNTS_GITHUB_ID` and `ACCOUNTS_GITHUB_SEC` are missing');
}
