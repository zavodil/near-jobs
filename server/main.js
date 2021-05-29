import { Meteor } from 'meteor/meteor';

import { app } from '/imports/lib/app.js';
import { profiles } from '/imports/server/profiles/lib.js';
import { jobs } from '/imports/server/jobs/lib.js';

import '/imports/server/accounts.js';
import '/imports/server/service-configurations.js';
import '/imports/server/collections';
import '/imports/server/crons';
import '/imports/server/methods';

/*
 * Get authenticated (via GitHub) user details, otherwise throw an error
 * Used in Meteor.Methods to ensure user
 *
 * @namespace app
 * @method checkUser
 * @param {String} _id - User's _id
 * @param {Object} [fields] - Optional Mongo Fields Specifier object. By default it would pick `profile` and `user.services.github` props
 * @throws {Meteor.Error}
 * @returns {Object} - User's object with required fields
 */
app.checkUser = (_id, fields) => {
  if (!_id) {
    throw new Meteor.Error(401, 'Please, login');
  }

  const user = Meteor.users.findOne(_id, fields || {
    fields: {
      profile: 1,
      'services.github.id': 1,
      'services.github.username': 1,
      'services.github.accessToken': 1
    }
  });

  if (!user.services?.github?.accessToken) {
    throw new Meteor.Error(401, 'Please, login via GitHub');
  }

  return user;
};

app.profiles = profiles;
app.jobs = jobs;

export { app };
