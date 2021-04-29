import { Mongo } from 'meteor/mongo';

const profiles = new Mongo.Collection('profiles');

export { profiles };
