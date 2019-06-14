# NativeScript image builder
A Node JS Solution for building images for NativeScript.

These tool allows you to generate the required image versions for android and ios.

  **Android:**

* hdpi
* ldpi
* mdpi
* xhdpi
* xxhdpi
* xxxhdpi

**iOS**
* @3x
* @2x
* @1x


## Setup
In your NativeScript project install the folowing dependencies

```
npm i gulp image-size resize-img
```

Download the *gulpfile.js* and place it into your src main folder
****
In this file you have to configure the following variables according to your folder location preference you can find them at the begining of the *file*, these paths must be relative to *gulpfile.js* if the folders don't exist they will be created automatically.

1. **SRC_FOLDER** (Location of your base images)
2. **ANDROID_PATH** (Location of the android destination folder )
3. **IOS_PATH** (Location of the ios destination folder )

## Usage
**Build mode**

If you want to single run the image builder
```
gulp build
``` 
**Watch mode**

If you want to watch changes on the source folder to run the image builder
```
gulp watch
``` 

If any image is removed from the source folder the associated images that were previously built will be removed from the android and ios folders.

### Note 
In order to match naming requirements of NativeScript file names are normalized, meaning that the filename becomes lowercase, spaces are replaced with underscores and special accented characters are normalized using NFC.