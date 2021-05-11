import { Template } from 'meteor/templating';

import './profile-preview.jade';

Template.profilePreview.helpers({
  getFirst(arr) {
    return arr && arr.length ? arr[0] : '';
  }
});
