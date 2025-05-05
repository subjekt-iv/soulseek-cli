import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Search from '../modules/Search.js';
import SearchService from '../services/SearchService.js';
import DownloadService from '../services/DownloadService.js';
import CredentialsService from '../services/CredentialsService.js';

const log = console.log;

// Available file modes
const modes = ['mp3', 'flac'];

class DownloadCommand {
  constructor(queries, options) {
    // Process tracklist file if provided
    if (options.tracklist) {
      const tracklistPath = path.resolve(options.tracklist);
      try {
        // Read tracklist file and split into queries
        const tracklistContent = fs.readFileSync(tracklistPath, 'utf-8');
        queries = tracklistContent.split('\n').map(line => line.trim()).filter(line => line !== '');
      } catch (err) {
        console.log(chalk.red(`Error reading tracklist file ${tracklistPath}: ${err.message}`));
        process.exit(1);
      }
    }

    // Validate if queries are provided
    if (queries.length === 0) {
      console.log(chalk.red('Please add a search query or provide a valid --tracklist file'));
      process.exit(1);
    }

    // Validate other options as before
    if (!modes.includes(options.mode)) {
      console.log(chalk.red(`--mode is invalid. Valid values: ${modes.join(', ')}`));
      process.exit(1);
    }

    if (options.mode === 'flac' && options.quality) {
      console.log(chalk.red('--quality is incompatible with the "flac" mode. Please remove this option.'));
      process.exit(1);
    }

    // Initialize with options and queries
    this.options = options;
    this.searchService = new SearchService(queries);
    this.downloadService = new DownloadService(this.searchService, options.destination); // Pass destination to DownloadService
    this.search = null;

    this.credentialsService = new CredentialsService();
    this.credentialsService.connect(this.onConnected.bind(this));
  }

  /**
   * @param {SlskClient} client
   */
  onConnected(client) {
    this.search = new Search(this.searchService, this.downloadService, this.options, client);
    this.search.search();
  }
}

export default DownloadCommand;
