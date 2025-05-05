import inquirer from 'inquirer';
import _ from 'lodash';
import chalk from 'chalk';
import FilterResult from './FilterResult.js';
import Download from './Download.js';
const log = console.log;

export default function (searchService, downloadService, options, client) {
  console.log('Initializing search with options:', options);
  this.download = new Download(downloadService, searchService, options, client);
  this.filterResult = new FilterResult(options.quality, options.mode);
  this.searchService = searchService;
  this.downloadService = downloadService;
  this.client = client;
  this.timeout = options.timeout ?? 2000;
  this.showPrompt = options.showPrompt ?? true;

  /**
   * Launch search query, then call a callback
   */
  this.search = () => {
    const query = this.searchService.getNextQuery();
    log(chalk.green("Searching for '%s'"), query);
    console.log('Search parameters:', {
      req: query,
      timeout: this.timeout,
    });
    const searchParam = {
      req: query,
      timeout: this.timeout,
    };
    const afterSearch = (err, res) => this.onSearchFinished(err, res);
    this.client.search(searchParam, afterSearch);
  };

  /**
   * Callback called when the search query get back
   */
  this.onSearchFinished = (err, res) => {
    if (err) {
      log(chalk.red(err));
      console.error('Error during search:', err);
      return;
    }

    console.log('Search results:', res);
    const filesByUser = this.filterResult.filter(res);
    console.log('Filtered results:', filesByUser);
    this.checkEmptyResult(filesByUser);

    if (this.showPrompt) {
      this.showResults(filesByUser);
    } else {
      this.showTopResult(filesByUser);
      process.exit(0);
    }
  };

  /**
   * If the result set is empty and there is no pending searches quit the process.
   * If there is pending searches, launch the next search.
   * If the result set is not empty just log success message.
   */
  this.checkEmptyResult = (filesByUser) => {
    if (_.isEmpty(filesByUser)) {
      log(chalk.red('Nothing found'));
      console.log('No files found for current query.');
      this.searchService.consumeQuery();

      if (this.searchService.allSearchesCompleted()) {
        console.log('All searches completed. Exiting.');
        process.exit(1);
      }

      this.search();
    } else {
      log(chalk.green('Search finished'));
      console.log('Files found for current query.');
    }
  };

  /**
   * Display the top result
   *
   * @param {array} filesByUser
   */
  this.showTopResult = (filesByUser) => {
    const numResults = Object.keys(filesByUser).length;

    if (numResults > 0) {
      const topResult = String(_.keys(filesByUser)[0]);
      log(chalk.green('Search returned ' + numResults + ' results'));
      log(chalk.blue('Top result: %s'), topResult);
      console.log('Top result:', topResult);
    }
  };

  /**
   * Display a list of choices that the user can choose from.
   *
   * @param {array} filesByUser
   */
  this.showResults = (filesByUser) => {
    const numResults = Object.keys(filesByUser).length;

    log(chalk.green('Displaying ' + numResults + ' search results'));

    // Limiting choices to five results
    const choices = _.keys(filesByUser).slice(0, 5); // Get the first five keys

    const options = {
      type: 'rawlist',
      name: 'user',
      pageSize: 10,
      message: 'Choose a folder to download',
      choices: choices,
    };
    inquirer.prompt([options]).then((answers) => this.processChosenAnswers(answers, filesByUser));
  };


  /**
   * From the user answer, trigger the download of the folder
   * If there is pending search, launch the next search query
   *
   * @param {array} answers
   * @param filesByUser
   */
  this.processChosenAnswers = (answers, filesByUser) => {
    console.log('User selected:', answers);
    this.searchService.consumeQuery();
    this.download.startDownloads(filesByUser[answers.user]);

    if (this.searchService.allSearchesCompleted()) {
      console.log('All searches completed. Flushing download log.');
      this.downloadService.downloadLogger.flush();
      this.downloadService.everyDownloadCompleted();
    } else {
      this.search();
    }
  };
}
