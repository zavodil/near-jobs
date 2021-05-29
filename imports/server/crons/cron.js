import JoSk from 'josk';
import { MongoInternals } from 'meteor/mongo';

const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
const cron = new JoSk({
  db,
  prefix: 'near',
  autoClear: true
});

const parseTags = (obj, tags) => {
  for (const label of tags) {
    if (label.name.startsWith('availability:')) {
      if (!obj.availability) {
        obj.availability = [];
      }
      obj.availability.push(label.name.replace('availability:', ''));
    } else if (label.name.startsWith('category:')) {
      if (!obj.category) {
        obj.category = [];
      }
      obj.category.push(label.name.replace('category:', ''));
    } else if (label.name.startsWith('skills:')) {
      if (!obj.skills) {
        obj.skills = [];
      }
      obj.skills.push(label.name.replace('skills:', ''));
    } else if (label.name === 'remote') {
      obj.isRemote = true;
    }

    if (!obj.tags) {
      obj.tags = [];
    }
    obj.tags.push(label.name);
  }
};


export { cron, parseTags };
