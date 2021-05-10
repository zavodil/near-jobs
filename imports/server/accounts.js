import { Accounts } from 'meteor/accounts-base';

Accounts.config({
  sendVerificationEmail: false
});

Accounts.onCreateUser(function (options, user) {
  if (!options.profile.name) {
    options.profile.name = user.services.github.username;
  }

  options.profile.github = {
    id: user.services.github.id,
    username: user.services.github.username,
    avatarUrl: `https://avatars.githubusercontent.com/u/${user.services.github.id}`
  };

  user.profile = options.profile;
  return user;
});
