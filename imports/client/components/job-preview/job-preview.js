import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './job-preview.jade';

Template.jobPreview.helpers({
  getFirst(arr) {
    return arr && arr.length ? arr[0] : '';
  },
  isApplied() {
    const user = Meteor.user();
    if (!user) {
      return false;
    }

    return user.profile.applied?.includes(this.issue.number);
  }
});
