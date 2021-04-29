import { Mongo } from 'meteor/mongo';

const jobs = new Mongo.Collection('jobs');

export { jobs };
