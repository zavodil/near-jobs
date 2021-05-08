import { Meteor } from 'meteor/meteor';
import { Octokit } from 'octokit';
import { appOctokit } from '/imports/server/octokit/lib.js';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';

import { app } from '/server/main.js';

const jobs = {
  async upsert(user, form) {
    let newTags = app.clone(form.tags);
    console.log(1, {newTags, form, user})
    let removedTags = [];

    const profile = profilesCollection.findOne({ owner: user._id }, {
      fields: {
        company: 1
      }
    });

    const update = {
      $set: {
        title: form.title,
        owner: user._id,
        'company.login': profile.company.login,
        'company.id': profile.company.id,
        'user.login': user.services.github.username,
        tags: form.tags,
        body: form.description
      }
    };

    const octokit = new Octokit({
      auth: user.services.github.accessToken
    });

    if (!form.issue || !form.isUpdate) {
      try {
        const newIssue = await octokit.rest.issues.create({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.jobs,
          title: form.title,
          body: form.description
        });

        form.issue = {
          number: newIssue.data.number
        };

        update.$set['issue.state'] = 'open';
        update.$set['issue.number'] = newIssue.data.number;
        update.$set['issue.updated_at'] = +new Date(newIssue.data.updated_at);
      } catch (e) {
        console.error('[profiles.upsert] [octokit.rest.issues.create] Error:', e);
        throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
      }
    } else {
      if (form.existingTags && form.existingTags.length > 0) {
        newTags = form.tags.filter(x => !form.existingTags.includes(x));
        removedTags = form.existingTags.filter(x => !form.tags.includes(x));

        if (removedTags.length === 1) {
          // REMOVE SINGLE LABEL
          try {
            await appOctokit.rest.issues.removeLabel({
              owner: Meteor.settings.public.repo.org,
              repo: Meteor.settings.public.repo.jobs,
              issue_number: form.issue.number,
              name: removedTags[0]
            });
          } catch (e) {
            console.error('[profiles.upsert] [octokit.rest.issues.removeLabel] Error:', e);
            throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
          }
        } else if (removedTags.length > 1) {
          // REMOVE ALL LABELS AS THERE IS NO removeLabels METHOD
          // AND WE ARE LIMITED TO 30 REQUEST PER MINUTE
          // SO IT'S CHEAPER TO REMOVE ALL LABELS IN CASE IF ANY WAS REMOVED
          try {
            await appOctokit.rest.issues.removeAllLabels({
              owner: Meteor.settings.public.repo.org,
              repo: Meteor.settings.public.repo.jobs,
              issue_number: form.issue.number
            });
          } catch (e) {
            console.error('[profiles.upsert] [octokit.rest.issues.removeAllLabels] Error:', e);
            throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
          }

          for (const tag of form.existingTags) {
            if (!removedTags.includes(tag)) {
              newTags.push(tag);
            }
          }
        }
      }

      newTags = app.uniq(newTags);

      // UPDATE ISSUE
      try {
        const updatedIssue = await octokit.rest.issues.update({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.jobs,
          issue_number: form.issue.number,
          title: form.title,
          state: 'open', // <-- REOPEN IF CLOSED
          body: form.description
        });

        update.$set['issue.state'] = 'open';
        update.$set['issue.number'] = form.issue.number;
        update.$set['issue.updated_at'] = +new Date(updatedIssue.data?.updated_at || 0);
      } catch (e) {
        console.error('[profiles.upsert] [octokit.rest.issues.update] Error:', e);
        throw new Meteor.Error(e.status || 500, 'Server error occurred. Please, try again later');
      }
    }

    if (newTags && newTags.length) {
      // ADD NEW LABELS
      try {
        await appOctokit.rest.issues.addLabels({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.jobs,
          issue_number: form.issue.number,
          labels: newTags
        });
      } catch (e) {
        console.error('[profiles.upsert] [appOctokit.rest.issues.addLabels] Error:', e);
        throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
      }
    }

    update.$set.location = form.location;
    update.$set.isRemote = form.isRemote;
    update.$set.availability = form.availability;
    update.$set.category = form.category;
    update.$set.skills = form.skills;

    jobsCollection.upsert({
      'issue.number': form.issue.number,
    }, update);

    Meteor.users.update(user._id, {
      $addToSet: {
        'profile.jobs': form.issue.number
      }
    });

    return form.issue.number;
  },
  async close(user, number) {
    const octokit = new Octokit({
      auth: user.services.github.accessToken
    });

    try {
      await octokit.rest.issues.update({
        owner: Meteor.settings.public.repo.org,
        repo: Meteor.settings.public.repo.jobs,
        issue_number: number,
        state: 'closed'
      });
    } catch (e) {
      console.error('[profiles.close] [octokit.rest.issues.update] Error:', e);
      throw new Meteor.Error(e.status || 500, 'Server error occurred. Please, try again later');
    }

    jobsCollection.update({ 'issue.number': number }, {
      $set: {
        'issue.state': 'closed'
      }
    });

    return true;
  },
  async reopen(user, number) {
    const octokit = new Octokit({
      auth: user.services.github.accessToken
    });

    try {
      await octokit.rest.issues.update({
        owner: Meteor.settings.public.repo.org,
        repo: Meteor.settings.public.repo.jobs,
        issue_number: number,
        state: 'open'
      });
    } catch (e) {
      console.error('[profiles.reopen] [octokit.rest.issues.update] Error:', e);
      throw new Meteor.Error(e.status || 500, 'Server error occurred. Please, try again later');
    }

    jobsCollection.update({ 'issue.number': number }, {
      $set: {
        'issue.state': 'open'
      }
    });

    return true;
  }
};

export { jobs };
