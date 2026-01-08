const appEnv = process.env.APP_ENV || 'development';
const envFile = `.env.${appEnv}`;

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    "nativewind/babel",
    ["module:react-native-dotenv", {
      "moduleName": "@env",
      "path": envFile,
      "blacklist": null,
      "whitelist": null,
      "safe": false,
      "allowUndefined": true
    }]
  ],
};
