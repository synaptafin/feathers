export default defineNuxtPlugin({
  name: 'abc',
  hooks: {
    'app:created': ( ) => console.log('App has been created - from abc plugin'),
  }
});
