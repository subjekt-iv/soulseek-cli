import chalk from 'chalk';
const log = console.log;

export default function (searchService, downloadService) {
  console.log('Initializing downloadLogger with searchService and downloadService');
  this.searchService = searchService;
  this.downloadService = downloadService;
  this.logBuffer = '';
  this.fileIndex = 0;

  /**
   * Display a line in the terminal showing the number of the downloaded file, the total number of file to download and the path to the downloaded file.
   * @param  {string} path Path of the downloaded file
   */
  this.downloadComplete = (path) => {
    this.fileIndex++;
    let logInfo = '(' + this.fileIndex + '/{{totalFileCount}}) Received: ' + path;

    console.log('Download complete for file:', path);

    if (this.searchService.allSearchesCompleted()) {
      logInfo = logInfo.replace(/{{totalFileCount}}/g, this.downloadService.getFileCount());
      log(logInfo);
    } else {
      this.logBuffer += logInfo + '\n';
    }
  };

  /**
   * Write in the terminal every lines stored in the buffer, then reset it to empty string.
   */
  this.flush = () => {
    if (this.logBuffer.length > 0) {
      this.logBuffer = this.logBuffer.replace(/{{totalFileCount}}/g, this.downloadService.getFileCount()).slice(0, -1);
      log('Flushing log buffer:');
      log(this.logBuffer);
      this.logBuffer = '';
    }
  };

  /**
   * Write a line summing the number of file starting to download.
   * @param  {number} fileCount Number of files
   */
  this.startDownload = (fileCount) => {
    log(chalk.green('Starting download of ' + fileCount + ' file' + (fileCount > 1 ? 's' : '') + '...'));
    console.log('Starting download of', fileCount, 'file(s)');
  };
}
