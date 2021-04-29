import { app } from '/imports/lib/app.js';
import { Template } from 'meteor/templating';

import './_404.jade';

Template._404.onRendered(app.isReady);
