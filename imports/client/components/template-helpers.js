import { Template } from 'meteor/templating';
import { app } from '/imports/lib/app.js';

Template.registerHelper('isSmall', () => app.isSmall);
