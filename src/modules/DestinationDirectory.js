import path from 'path';
import fs from 'fs';
import process from 'process';

export default function (destination) {
  console.log('Initializing DestinationDirectory with:', { destination });
  this.destination = destination;

  /**
   * Compute the final destination repository, depending on the "destination" option
   * @param  {string} directory
   * @return {string}
   */
  this.getDestinationDirectory = (directory) => {
    console.log('Getting destination directory for:', { directory });
    let dir;

    if (this.destination) {
      if (path.isAbsolute(this.destination)) {
        dir = this.destination + path.sep + directory;
      } else {
        dir = process.cwd() + path.sep + this.destination + path.sep + directory;
      }
    } else {
      dir = process.cwd() + path.sep + directory;
    }

    console.log('Final destination directory:', dir);
    createIfNotExist(dir);

    return dir;
  };
}

/**
 * Create a directory if it doesn't exist
 * @param {string} dir
 */
let createIfNotExist = (dir) => {
  console.log('Creating directory if it does not exist:', { dir });
  const dirList = dir.split(path.sep);
  let buildPath = '';

  for (let i = 0; i < dirList.length; i++) {
    buildPath += dirList[i] + path.sep;
    if (!fs.existsSync(buildPath)) {
      console.log('Creating directory:', buildPath);
      fs.mkdirSync(buildPath);
    }
  }
};
