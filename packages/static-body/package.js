Package.describe({
  name: 'static-body',
  version: '0.0.1',
  summary: '',
  git: ''
});

Package.onUse((api) => {
  api.versionsFrom('1.5');
  api.use('static-html', 'client');
  api.addFiles('static-body.html', 'client');
});
