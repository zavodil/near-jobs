import { Meteor } from 'meteor/meteor';

import { app } from '/imports/lib/app.js';

import '/imports/server/service-configurations.js';
import '/imports/server/methods';

app.checkUser = (_id, fields) => {
  if (!_id) {
    throw new Meteor.Error(401, 'Please, login');
  }

  const user = Meteor.users.findOne(this._id, fields || {
    fields: {
      profile: 1,
      'user.services.github.id': 1,
      'user.services.github.username': 1,
      'user.services.github.accessToken': 1
    }
  });

  if (!user.services.github.accessToken) {
    throw new Meteor.Error(401, 'Please, login via GitHub');
  }

  return user;
};

export { app };
