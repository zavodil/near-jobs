import { cron, parseTags } from './cron.js';
import { Meteor } from 'meteor/meteor';
import { appOctokit } from '/imports/server/octokit/lib.js';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';

const bound = Meteor.bindEnvironment((callback) => {
  callback();
});

const day1 = 60 * 1000 * 60 * 24;

const syncJobs = (ready) => {
  bound(async () => {
    const issues = await appOctokit.rest.search.issuesAndPullRequests({
      q: `is:issue updated:>${new Date(Date.now() - day1).toISOString()} -label:review-pending repo:${Meteor.settings.public.repo.org}/${Meteor.settings.public.repo.jobs}`,
      sort: 'sort:updated-desc',
      order: 'desc',
      per_page: 100,
      page: 1
    });

    if (issues.data?.items.length) {
      for (const issue of issues.data.items) {
        const profile = profilesCollection.findOne({
          'user.login': issue.user.login,
          'issue.state': 'open'
        }, {
          fields: {
            _id: 1,
            type: 1,
            title: 1,
            owner: 1,
            company: 1
          }
        });

        if (!profile || profile.type !== 'company') {
          // QUIT; CAN NOT CREATE A NEW JOB WITHOUT RESPONSIBLE PROFILE; JOBS ARE COMPANY ACCOUNT TYPE FEATURE
          continue;
        }

        const job = jobsCollection.findOne({
          'issue.number': issue.number
        });

        const updatedAt = +new Date(issue.updated_at);
        let isNew = false;
        if (!job) {
          isNew = true;
        } else {
          if (job.issue.updated_at === updatedAt) {
            // QUIT; NO CHANGES, SAME TIMESTAMP
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
            company: {
              id: profile.company.id,
              login: profile.company.login,
              title: profile.title
            },
            isRemote: false,
            location: {},
            owner: user._id,
            skills: [],
            tags: [],
            title: issue.title,
            user: {
              avatarUrl: user.profile.github.avatarUrl,
              id: user.profile.github.id,
              issue: {
                number: user.profile.issue.number
              },
              login: user.services.github.username
            },
            applies: 0
          };

          parseTags(insert, issue.labels);
          jobsCollection.insert(insert);
        } else {
          const update = {};
          const remove = {};
          const tagsObj = {};
          parseTags(tagsObj, issue.labels);

          if (Object.keys(tagsObj).length) {
            for (const key in tagsObj) {
              if (job[key] && Array.isArray(job[key])) {
                for (const value of tagsObj[key]) {
                  if (!job[key].includes(value)) {
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

                for (const value of job[key]) {
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

          if (job.isRemote !== tagsObj.isRemote) {
            if (!update.$set) {
              update.$set = {};
            }

            if (!tagsObj.isRemote) {
              update.$set.isRemote = false;
            } else {
              update.$set.isRemote = true;
            }
          }

          if (job.title !== issue.title) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set.title = issue.title;
          }

          if (job.issue.state !== issue.state) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set['issue.state'] = issue.state;
          }

          if (job.issue.updated_at !== updatedAt) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set['issue.updated_at'] = updatedAt;
          }

          if (!issue.body.includes(job.body)) {
            if (!update.$set) {
              update.$set = {};
            }

            update.$set.body = issue.body;
          }

          if (Object.keys(update).length) {
            jobsCollection.update({ _id: job._id }, update);
          }

          if (Object.keys(remove).length) {
            jobsCollection.update({ _id: job._id }, remove);
          }
        }
      }
    }
    ready();
  });
};

cron.setInterval(syncJobs, 36000000, 'syncJobsGithub');
