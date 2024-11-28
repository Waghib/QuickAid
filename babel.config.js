module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['@babel/plugin-transform-private-methods'],
 plugins: [
  '@babel/plugin-transform-private-methods',
  '@babel/plugin-transform-class-properties',
  '@babel/plugin-transform-private-property-in-object',
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
