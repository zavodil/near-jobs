import { Template } from 'meteor/templating';

import './job-preview.jade';

Template.jobPreview.helpers({
  getFirst(arr) {
    return arr[0];
  }
});
