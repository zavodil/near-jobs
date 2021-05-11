import { Template } from 'meteor/templating';
import { app } from '/imports/lib/app.js';
import './index.sass';
import './index.jade';

Template.index.onRendered(app.isReady);
