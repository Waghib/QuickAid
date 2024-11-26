module.exports = {
  presets: ['module:metroreact-native-babel-preset'],
 plugins: [
   [
     'module:react-native-dotenv',
     {
       envName: 'APP_ENV',
       moduleName: '@env',
       path: '.env',
       safe: false,
       allowUndefined: true,
       blocklist: null,
       allowlist: null,
      },
    ],
  ],
};
