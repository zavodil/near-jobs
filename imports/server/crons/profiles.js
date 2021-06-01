import { cron, parseTags } from './cron.js';
import { Meteor } from 'meteor/meteor';
import { appOctokit } from '/imports/server/octokit/lib.js';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';

const bound = Meteor.bindEnvironment((callback) => {
  callback();
});

const day1 = 60 * 1000 * 60 * 24;

const syncProfiles = (ready) => {
  bound(async () => {
    let issues;
    try {
      issues = await appOctokit.rest.search.issuesAndPullRequests({
        q: `is:issue updated:>${new Date(Date.now() - day1).toISOString()} -label:review-pending repo:${Meteor.settings.public.repo.org}/${Meteor.settings.public.repo.profiles}`,
        sort: 'sort:updated-desc',
        order: 'desc',
        per_page: 100,
        page: 1
      });
    } catch (e) {
      console.error('[syncProfiles] [appOctokit.rest.search.issuesAndPullRequests] Error', e);
      ready();
      return;
    }

    if (issues.data?.items.length) {
      for (const issue of issues.data.items) {
        const profile = profilesCollection.findOne({
          'user.login': issue.user.login
        });

        const updatedAt = +new Date(issue.updated_at);
        let isNew = false;
        if (!profile) {
          isNew = true;
        } else {
          if (profile.issue?.updated_at === updatedAt) {
            // QUIT; NO CHANGES, SAME TIMESTAMP
            continue;
          }

          if (profile.issue?.number !== issue.number) {
            // QUIT; MULTIPLE PROFILES BY THE SAME USER
            continue;
          }
        }

        if (isNew) {
          const user = Meteor.users.findOne({ _id: profile.owner });
          if (!user) {
            // QUIT; CAN NOT CREATE A NEW JOB WITHOUT RESPONSIBLE USER
            continue;
          }

          const insert = {
            issue: {
              number: issue.number,
              state: issue.state,
              updated_at: updatedAt
            },
            availability: [],
            body: issue.body,
            category: [],
            isRemote: false,
            location: {},
            owner: user._id,
            skills: [],
            tags: [],
            title: issue.title,
            user: {
              id: user.profile.github.id,
              login: user.services.github.username
            },
            applies: 0
          };

          parseTags(insert, issue.labels);
          profilesCollection.insert(insert);
        } else {
          const update = {};
          const remove = {};
          const tagsObj = {};
          parseTags(tagsObj, issue.labels);

          if (Object.keys(tagsObj).length) {
            for (const key in tagsObj) {
              if (profile[key] && Array.isArray(profile[key])) {
                for (const value of tagsObj[key]) {
                  if (!profile[key].includes(value)) {
                    if (!update.$addToSet) {
                      update.$addToSet = {};
                    }

                    if (!update.$addToSet[key]) {
                      update.$addToSet[key] = {
                        $each: []
                      };
                    }

                    update.$addToSet[key].$each.push(value);
                  }
                }

                for (const value of profile[key]) {
                  if (!tagsObj[key].includes(value)) {
                    if (!remove.$pullAll) {
                      remove.$pullAll = {};
                    }

                    if (!remove.$pullAll[key]) {
                      remove.$pullAll[key] = [];
                    }
                    remove.$pullAll[key].push(value);
                  }
                }
              }
            }
          }

          if (profile.isRemote !== tagsObj.isRemote) {
            if (!update.$set) {
              update.$set = {};
            }

            if (!tagsObj.isRemote) {
              update.$set.isRemote = false;
            } else {
              update.$set.isRemote = true;
            }
          }

          const title = issue.title.replace(/^(CV|Company)\:\ /, '');

          if (profile.title !== title) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set.title = title;
          }

          if (profile.issue.state !== issue.state) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set['issue.state'] = issue.state;
          }

          if (profile.issue.updated_at !== updatedAt) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set['issue.updated_at'] = updatedAt;
          }

          if (!issue.body.includes(profile.body)) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set.body = issue.body;
          }

          if (Object.keys(update).length) {
            profilesCollection.update({ _id: profile._id }, update);
          }

          if (Object.keys(remove).length) {
            profilesCollection.update({ _id: profile._id }, remove);
          }
        }
      }
    }
    ready();
  });
};

cron.setInterval(syncProfiles, 36000000, 'syncProfilesGithub');
