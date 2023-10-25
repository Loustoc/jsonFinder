const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const folder_name = "";
const ignore_string = "";
const output_folder = "";

const directoryPath = path.join(__dirname, folder_name);
let _path = path.relative(__dirname, folder_name);

let allImageUrls = [];
let reworkedURLS = [];
let currentlyInspected = [];
let currFile = [];

const checkifFinished = async _file => {
  if (!currentlyInspected.includes(1)) {
    console.log("finished !");
    console.log(currFile);
    currFile.indexOf(_file) > -1
      ? currFile.splice(currFile.indexOf(_file), 1)
      : null;
    return;
  }
};
​
const inspectObj = async (obj, _file) => {
  let key = currentlyInspected.length;
  Object.keys(obj).forEach((element, i) => {
    currentlyInspected[key] = 1;
    if (element == "image") {
      let url = obj[element].url || null;
      url ? allImageUrls.push(url) : null;
    } else if (typeof obj[element] === "object" && obj[element] !== null) {
      if (Object.keys(obj[element]).length > 0) {
        inspectObj(obj[element], _file);
      }
    }
    if (i == Object.keys(obj).length - 1) {
      currentlyInspected[key] = 0;
      checkifFinished(_file);
    }
  });
};
​
fs.readdir(directoryPath, function async(err, files) {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  files.forEach(async function (file, i) {
    currFile.push(i);
    console.log("file numero " + i);
    var obj = JSON.parse(fs.readFileSync(`${_path}/${file}`, "utf8"));
    let interval = await inspectObj(obj, i);
    if (i == files.length - 1) {
      console.log("URLS:");
      console.log(allImageUrls);
      console.log(allImageUrls.length);
      process.stdin.resume();
      const curlCommand = getCurlToDownloadAllImages();
      exec(curlCommand);
    }
    return interval;
  });
});
​
function getCurlToDownloadAllImages() {
  for (let i = 0; i < 19; i++) {
    reworkedURLS.push(
      allImageUrls[i].slice(0, allImageUrls[i].indexOf(ignore_string))
    );
  }
  return `curl ${[...new Set(reworkedURLS)]
    .map(url => ` -O --output-dir ${output_folder} ${url}`)
    .join("")}`;
}