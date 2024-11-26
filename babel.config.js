module.exports = {
  presets:['module:metro-react-preset'],
 plugins: [
   ['module:react-native-dotenv', {
     moduleName: '@env',
     path: '.env',
     blacklist: null,
     whitelist: null,
     safe: false,
      allowUndefined: true,
    }],
  ],
};