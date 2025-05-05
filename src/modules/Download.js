import fs from 'fs';
import process from 'process';
import chalk from 'chalk';
import DestinationDirectory from './DestinationDirectory.js';
const log = console.log;

export default function (downloadService, searchService, options, client) {
  console.log('Initializing download with options:', options);
  this.destinationDirectory = new DestinationDirectory(options.destination);
  this.downloadService = downloadService;
  this.searchService = searchService;
  this.client = client;

  /**
   * Call prepare download method,
   * then launch the download of each files in the list
   *
   * @param {array} files
   */
  this.startDownloads = (files) => {
    console.log('Preparing to download files:', files);
    this.downloadService.prepareDownload(files);
    files.forEach((file) => this.downloadFile(file));
  };

  /**
   * Download a single file from the selected answer
   *
   * @param file
   */
  this.downloadFile = (file) => {
    console.log('Downloading file:', file);
    const fileStructure = file.file.split('\\');
    const directory = fileStructure[fileStructure.length - 2];
    const filename = fileStructure[fileStructure.length - 1];

    const data = {
      file,
      path: this.destinationDirectory.getDestinationDirectory(directory) + '/' + filename,
    };

    if (this.checkFileExists(data.path, filename)) {
      console.log('File already exists:', data.path);
      return;
    }

    log(filename + chalk.yellow(' [downloading...]'));

    this.client.download(data, (err, down) => {
      if (err) {
        log(chalk.red(err));
        process.exit();
      }

      console.log('Download complete for file:', down.path);
      this.downloadService.downloadComplete(down.path);
    });
  };

  this.checkFileExists = (path, filename) => {
    let fileExists = false;

    if (fs.existsSync(path)) {
      log(filename + chalk.green(' [already downloaded: skipping]'));
      this.downloadService.decrementFileCount();

      if (this.searchService.allSearchesCompleted() && this.downloadService.getFileCount() === 0) {
        log('No file to download.');
        process.exit();
      }

      fileExists = true;
    }

    return fileExists;
  };
}
