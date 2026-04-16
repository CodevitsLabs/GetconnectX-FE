/* global __dirname */
const fs = require('fs');
const path = require('path');

const resolveProjectFile = (projectRelativePath) => {
  if (!projectRelativePath) {
    return undefined;
  }

  const normalizedPath = projectRelativePath.replace(/^\.\//, '');
  const absolutePath = path.join(__dirname, normalizedPath);

  if (!fs.existsSync(absolutePath)) {
    return undefined;
  }

  return `./${normalizedPath}`;
};

module.exports = ({ config }) => {
  const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME?.trim();
  const iosGoogleServicesFile =
    process.env.GOOGLE_SERVICES_INFO_PLIST?.trim() ||
    resolveProjectFile('GoogleService-Info.plist') ||
    resolveProjectFile('ios/GoogleService-Info.plist') ||
    resolveProjectFile('ios/connectx/GoogleService-Info.plist');
  const androidGoogleServicesFile =
    process.env.GOOGLE_SERVICES_JSON?.trim() ||
    resolveProjectFile('google-services.json') ||
    resolveProjectFile('android/google-services.json') ||
    resolveProjectFile('android/app/google-services.json');
  const existingPlugins = Array.isArray(config.plugins) ? config.plugins : [];
  const pluginsWithoutGoogleSignIn = existingPlugins.filter((plugin) => {
    if (typeof plugin === 'string') {
      return plugin !== '@react-native-google-signin/google-signin';
    }

    return plugin?.[0] !== '@react-native-google-signin/google-signin';
  });

  const requestedPlugins = [
    "expo-font",
    "expo-image",
    "expo-location",
    "expo-sqlite",
    "expo-web-browser"
  ];

  requestedPlugins.forEach((plugin) => {
    if (!pluginsWithoutGoogleSignIn.includes(plugin)) {
      pluginsWithoutGoogleSignIn.push(plugin);
    }
  });

  if (googleIosUrlScheme) {
    pluginsWithoutGoogleSignIn.push([
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: googleIosUrlScheme,
      },
    ]);
  }

  const nextConfig = {
    ...config,
    plugins: pluginsWithoutGoogleSignIn,
  };

  const iosConfig = {
    ...(nextConfig.ios ?? {}),
  };
  const androidConfig = {
    ...(nextConfig.android ?? {}),
  };

  if (iosGoogleServicesFile) {
    iosConfig.googleServicesFile = iosGoogleServicesFile;
  } else {
    delete iosConfig.googleServicesFile;
  }

  if (androidGoogleServicesFile) {
    androidConfig.googleServicesFile = androidGoogleServicesFile;
  } else {
    delete androidConfig.googleServicesFile;
  }

  return {
    ...nextConfig,
    ios: iosConfig,
    android: androidConfig,
  };
};
