import collections from '/imports/lib/collections';

const app = {
  collections,
  slugify(str) {
    return str.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  }
};

export { app };
