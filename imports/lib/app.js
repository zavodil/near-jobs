const app = {
  slugify(str) {
    return str.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  },
  clone(o) {
    return Object.assign({}, { cloned: o }).cloned;
  },
  uniq(array) {
    return [...new Set(array)];
  },
  parseForm(form, freeFormFields) {
    const formData = {
      tags: []
    };

    for (const prop in form) {
      if (Array.isArray(form[prop])) {
        formData[prop] = [];
        formData[`${prop}Text`] = '';

        for (const _val of app.uniq(form[prop])) {
          if (_val && typeof _val === 'string') {
            const val = app.slugify(_val.trim());
            formData[prop].push(val);
            formData.tags.push(`${prop}:${val}`);
            formData[`${prop}Text`] += ` \`${val}\``;
          }
        }
      } else if (typeof form[prop] === 'string') {
        if (!freeFormFields.includes(prop)) {
          formData[prop] = app.slugify(form[prop].trim());
        } else if (prop === 'username') {
          formData.username = form.username.startsWith.startsWith('@') ? form.username.substr(1).trim() : form.username.trim();
        } else {
          formData[prop] = form[prop].trim();
        }
      }
    }

    return formData;
  }
};

export { app };
