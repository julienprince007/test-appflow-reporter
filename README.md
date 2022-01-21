[![Netlify Status](https://api.netlify.com/api/v1/badges/700d8073-fc64-4523-bb5a-24b2b3c562eb/deploy-status)](https://app.netlify.com/sites/sowellapp-reporter/deploys)

> Deploy via code push
> Setup target version on package.json then
> `yarn codepush-deploy-ios` > `yarn codepush-deploy-android`
> Target version syntax :

```javascript
Range Expression    Who gets the update
----------------    ----------------------
1.2.3               Only devices running the specific binary app store version 1.2.3 of your app
*                   Any device configured to consume updates from your CodePush app
1.2.x               Devices running major version 1, minor version 2 and any patch version of your app
1.2.3 - 1.2.7       Devices running any binary version between 1.2.3 (inclusive) and 1.2.7 (inclusive)
>=1.2.3 <1.2.7      Devices running any binary version between 1.2.3 (inclusive) and 1.2.7 (exclusive)
1.2                 Equivalent to >=1.2.0 <1.3.0
~1.2.3              Equivalent to >=1.2.3 <1.3.0
^1.2.3              Equivalent to >=1.2.3 <2.0.0
```

> WIP
> quasar dev -m cordova -T ios --device --buildFlag='-UseModernBuildSystem=0'

> iOS p12 pass: wgrebwoqkg

> TOKNOW
> Have Android version code automatically generated and based on semver by modifying :

```javascript
var versionCode = 0
if (+nums[0]) {
  // Change * 1000 by * 1000000
  versionCode += +nums[0] * 1000000
}
if (+nums[1]) {
  // Change * 100 by * 1000
  versionCode += +nums[1] * 1000
}
if (+nums[2]) {
  versionCode += +nums[2]
}
```

in /Users/donaldo/Dev/reporter.sowellapp.com/src-cordova/platforms/android/cordova/lib/prepare.js

> NB: When releasing a new version on stores assert to not trigger a new CodePush deployment to avoid app update once the user installs the app