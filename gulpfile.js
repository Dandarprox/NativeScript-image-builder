const SRC_FOLDER = './base_images';
const ANDROID_PATH = './android';
const IOS_PATH = './ios';

// Console colors definitions
const Reset = "\x1b[0m";

const FgBlack = "\x1b[30m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";

const {
  src,
  dest,
  watch,
  lastRun,
  series
} = require('gulp');
const fs = require('fs');
const img_size = require('image-size');
const resizeImg = require('resize-img');

const androidDirectories = [
  'drawable-hdpi',
  'drawable-ldpi',
  'drawable-mdpi',
  'drawable-xhdpi',
  'drawable-xxhdpi',
  'drawable-xxxhdpi'
];

const androidSizes = [
  1.50,
  0.75,
  1.00,
  2.00,
  3.00,
  4.00
];

let namingRegex = new RegExp(/([a-z]*[\_])*[a-z]*/i);

function imageBuilder(done) {
  removeUnused();
  let files = fs.readdirSync(SRC_FOLDER);

  files.forEach(file => { 

    // Check if extension of file is valid
    if (fileIsValid(file)) {

      if(isImageBuilt(file)) {
        console.log(`>> File ${file} was already built`);  
        return;
      }

      console.log("> Building image:", FgYellow, file, Reset, "as", FgMagenta, normalizeName(file), Reset);

      img_size(`${SRC_FOLDER}/${file}`, async function (err, dimentions) {
        if (err) {
          console.log("ERROR building image: ", err);
        }

        let currentWidth;
        let currentHeight;

        currentWidth = dimentions.width;  
        currentHeight = dimentions.height;  

        console.log(` * FILE ${file} dimentions are ${currentWidth}x${currentHeight}`);
        
        // Write android files to folder
        let i = 0;
        for (const size of androidSizes) {
          const buf = await resizeImg(fs.readFileSync(`${SRC_FOLDER}/${file}`),
            {
              width: Math.round(currentWidth * size),
              height: Math.round(currentHeight * size)
            });

          let fileName = normalizeName(file).match(namingRegex)[0];
          console.log("> Generating ANDROID", FgCyan, androidDirectories[i], Reset, "of", FgCyan, fileName, Reset);

          fs.writeFileSync(`${ANDROID_PATH}/${androidDirectories[i++]}/${fileName}.png`, buf);
        }
          
          // Write ios files to folder
        for (let j = 0; j < 3; ++j) {
          const buf = await resizeImg(fs.readFileSync(`${SRC_FOLDER}/${file}`),
            {
              width: Math.round(currentWidth * (j + 1)),
              height: Math.round(currentHeight * (j + 1))
            }
          );

          let fileName = normalizeName(file).match(namingRegex)[0];
          console.log("> Generating IOS", FgCyan, `@${j + 1}x`, Reset, "of", FgCyan, fileName, Reset);
          fs.writeFileSync(`${IOS_PATH}/${normalizeName(fileName)}@${j + 1}x.png`, buf);
        }
      });

    }
    
  });
  
  done();
}

function isImageBuilt(file) {
  // Lazy check for avoid rebuilding of images
  // ? Is good to asume that if we have an image in one of the android folders it is in the others ?

  let files = fs.readdirSync(`${ANDROID_PATH}/${androidDirectories[0]}`);
  files = files.map(c_file => normalizeName(c_file).match(namingRegex)[0]);

  file = normalizeName(file).match(namingRegex)[0];

  return files.some(c_file => c_file == file);
}

function removeUnused() {
  let baseFiles = fs.readdirSync(SRC_FOLDER);
  baseFiles = baseFiles.map(file => normalizeName(file));

  let userAlerted = false;
  let fileExists;
  // Check android folders
  for (const folder of androidDirectories) {
    let files = fs.readdirSync(`${ANDROID_PATH}/${folder}`);
    
    for (const file of files) {
      fileExists = false;

      for (const baseFile of baseFiles) {
        if(file == baseFile) {
          fileExists = true;
          break;
        } 
      }

      if (!fileExists) {
        fs.unlinkSync(`${ANDROID_PATH}/${folder}/${file}`);
        console.log("Removed file:");
        console.log(">>> ", `${ANDROID_PATH}/${folder}/${file}`);

        if(!userAlerted) {
          console.log(FgRed, ">> ! Removed file detected ", Reset, FgCyan, file, Reset, FgRed, " file was removed");
          userAlerted = true;
        }
      }
    }

  }
  
  // Check ios folder
  let files = fs.readdirSync(`${IOS_PATH}`);

  for (const file of files) {
    fileExists = false;

    for (const baseFile of baseFiles) {
      let matchFile = file.match(namingRegex);
      let matchBase = baseFile.match(namingRegex);

      if(matchFile[0] == matchBase[0]) {
        fileExists = true;
        break;
      }
    }

    if (!fileExists) {
      fs.unlinkSync(`${IOS_PATH}/${file}`);
    }
  }
}

function fileIsValid(fileName) {
  if (fileName.match(/.png$/i)) return true;
  return false;
}

function SYSTEM_LOG(log) {
  console.log(`>> ${log}`);
}

function createFolders(done) {

  // Create base folders for both OS
  let dirPath = IOS_PATH;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    SYSTEM_LOG("IOS Folder was created");
  }
  
  dirPath = ANDROID_PATH;
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    SYSTEM_LOG("Android Folder was created");
  }

  // Create extra folders only for android
  for (const directory of androidDirectories) {
    dirPath = `${ANDROID_PATH}/${directory}`;

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      SYSTEM_LOG(`Android subfolder ${directory} was created`);
    }

  }

  done();
}

function normalizeName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s/g, '_');
}

function watcher() {
  watch(['base_images/**/*.png'], imageBuilder);
}

module.exports = {
  watch: series(createFolders, imageBuilder, watcher),
  build: series(createFolders, imageBuilder)
}
