import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';

import { app } from '/server/main.js';

const PER_PAGE_LIMIT = 40;
const correctTagRe = /^(availability|category|skills)\:/i;
const tagsCats = ['availability:', 'category:', 'skills:'];
const keywords = ['remote'];

Meteor.methods({
  search(type, query, page) {
    check(type, Match.OneOf('candidates', 'projects', 'jobs'));
    check(query, Match.Optional([String]));
    check(page, Number);

    const search = {
      $and: [{
        'issue.state': 'open'
      }]
    };
    let collection = profilesCollection;

    if (type === 'jobs') {
      collection = jobsCollection;
    } else {
      if (type === 'candidates') {
        search.$and.push({type: 'candidate'});
      }

      if (type === 'projects') {
        search.$and.push({type: 'company'});
      }
    }

    if (query && query.length) {
      const $or = [];
      const textSearch = {
        $text: {
          $search: ''
        }
      };

      const tagsSearch = {
        tags: {
          $in: []
        }
      };

      for (const q of query) {
        if (typeof q === 'string') {
          if (keywords.includes(q)) {
            tagsSearch.tags.$in.push(q);
          } else {
            if (q.includes(':')) {
              if (q.startsWith('location:')) {
                const loc = q.replace('location:', '').trim();
                if (loc.length) {
                  tagsSearch.tags.$in.push(new RegExp(loc, 'g'));
                }
              } else if (correctTagRe.test(q)) {
                tagsSearch.tags.$in.push(q.trim());
              } else {
                q.split(':').forEach((t) => {
                  tagsSearch.tags.$in.push(new RegExp(t, 'g'));
                });
                tagsSearch.tags.$in.push(q);
              }
            } else {
              for (const cat of tagsCats) {
                tagsSearch.tags.$in.push(`${cat}${app.slugify(q)}`);
              }

              textSearch.$text.$search += `${q} `;
            }
          }
        }
      }

      if (textSearch.$text.$search.length || tagsSearch.tags.$in.length) {
        if (textSearch.$text && textSearch.$text.$search) {
          textSearch.$text.$search = textSearch.$text.$search.trim();
          $or.push(textSearch);
        }

        if (tagsSearch.tags.$in.length) {
          $or.push(tagsSearch);
        }

        search.$and.push({ $or });
      }
    }

    return collection.find(search, {
      fields: {
        _id: 1,
        body: 1,
        type: 1,
        issue: 1,
        budget: 1,
        company: 1,
        category: 1,
        location: 1,
        availability: 1,
        isRemote: 1,
        skills: 1,
        title: 1,
        user: 1
      },
      skip: (page - 1) * PER_PAGE_LIMIT,
      limit: PER_PAGE_LIMIT
    }).fetch();
  }
});
