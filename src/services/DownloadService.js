import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import DownloadLogger from '../modules/DownloadLogger.js';

const log = console.log;

class DownloadService {
  constructor(searchService, destination) {
    this.searchService = searchService;
    this.destination = path.resolve(destination); // Resolve the absolute path to avoid relative path issues
    this.downloadLogger = new DownloadLogger(searchService, this);
    this.downloadingFilesCount = 0;
    this.downloadCompleteCount = 0;
  }

  /**
   * Prepare for download by logging the number of files.
   * @param {Array} files - The files to be downloaded.
   */
  prepareDownload(files) {
    this.downloadLogger.startDownload(files.length);
    this.downloadingFilesCount += files.length;
  }

  /**
   * Handle completion of a single file download.
   * @param {string} downloadPath - The path where the file was downloaded.
   */
  downloadComplete(downloadPath) {
    log(`Download complete: ${downloadPath}`);
    this.downloadLogger.downloadComplete(downloadPath);
    this.downloadCompleteCount++;
    this.everyDownloadCompleted();
  }

  /**
   * Check if all downloads are completed.
   */
  everyDownloadCompleted() {
    if (this.downloadCompleteCount === this.downloadingFilesCount && this.searchService.allSearchesCompleted()) {
      log(`${this.downloadingFilesCount} file${this.downloadingFilesCount > 1 ? 's' : ''} downloaded.`);
      process.exit();
    }
  }

  /**
   * Decrement the count of files being downloaded.
   */
  decrementFileCount() {
    this.downloadingFilesCount--;
  }

  /**
   * Get the count of files being downloaded.
   * @returns {number} - The number of files being downloaded.
   */
  getFileCount() {
    return this.downloadingFilesCount;
  }

  /**
   * Download a track to the specified destination.
   * @param {string} track - The track URL or path.
   * @param {string} filename - The name of the file to be saved.
   */
  download(track, filename) {
    const downloadPath = path.join(this.destination, filename); // Ensure file is saved to the destination directory

    // Implement the actual download logic here, using `downloadPath` as the target location.
    // Example:
    log(chalk.green(`Downloading ${track} to ${downloadPath}`));

    // Simulate the download process
    fs.writeFileSync(downloadPath, `Downloaded content of ${track}`);

    this.downloadComplete(downloadPath);
  }
}

export default DownloadService;
