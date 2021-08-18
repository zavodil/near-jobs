import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import Spiderable from 'meteor/ostrio:spiderable-middleware';

WebApp.connectHandlers.use(new Spiderable({
  rootURL: 'https://metabuidl.nearspace.info/',
  serviceURL: 'https://render.ostr.io',
  auth: Meteor.settings.prerenderKey
}));
