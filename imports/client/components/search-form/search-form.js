import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '/imports/client/components/job-preview/job-preview.js';
import '/imports/client/components/profile-preview/profile-preview.js';
import './search-form.jade';

const PER_PAGE_LIMIT = 40;

Template.searchForm.onCreated(function () {
  this.isLoading = new ReactiveVar(true);
  this.hasNoMore = new ReactiveVar(false);
  this.results = new ReactiveVar([]);
  let lastPage = app.search.page.get();
  let lastResults = [];

  this.autorun(() => {
    const page = app.search.page.get();
    const query = [];
    const _query = app.search.query.get();

    if (_query && _query.length) {
      _query.trim().split(/\ |,/g).map((q) => q.includes(':') ? q : app.slugify(q)).filter((q) => q.length).forEach((q) => {
        query.push(q);
      });
    }

    this.isLoading.set(true);
    Meteor.call('search', app.search.type.get(), query, page, (error, results) => {
      setTimeout(() => {
        this.isLoading.set(false);
        if (error) {
          console.error(error);
          alert('Something went wrong, server returned an error');
        } else {
          if (lastPage === page || lastPage > page) {
            lastResults = results;
            this.results.set(lastResults);
          } else {
            lastPage = page;
            if (results && results.length) {
              lastResults = [...lastResults, ...results];
              this.results.set(lastResults);
            } else {
              this.hasNoMore.set(true);
            }
          }

          if (results.length < PER_PAGE_LIMIT) {
            this.hasNoMore.set(true);
          }
        }
      }, 768);
    });
  });
});

Template.searchForm.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  hasNoMore() {
    return Template.instance().hasNoMore.get();
  },
  getSearch() {
    return app.search.query.get();
  },
  searchResults() {
    return Template.instance().results.get();
  },
  searchType() {
    return app.search.type.get();
  }
});

Template.searchForm.events({
  'click [data-load-more]'(e) {
    e.preventDefault();
    app.search.page.set(app.search.page.get() + 1);
    return false;
  },
  'submit [data-search-form]'(e, template) {
    e.preventDefault();
    const query = e.currentTarget.search.value;
    if (!template.isLoading.get()) {
      app.search.query.set(query);
      app.search.page.set(1);
    }
    return false;
  }
});
