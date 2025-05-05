#!/usr/bin/env node

const VERSION = '0.3.0';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import DownloadCommand from './src/commands/download.js';
import QueryCommand from './src/commands/query.js';
import LoginCommand from './src/commands/login.js';

console.log('Starting soulseek-cli');

const program = new Command();
program.version(VERSION);

program
  .command('download [query...]')
  .description('Download with required query')
  .option('-d, --destination <folder>', 'downloads\'s destination')
  .option('-q, --quality <quality>', 'show only mp3 with a defined quality')
  .option('-m, --mode <mode>', 'filter the kind of files you want (available: "mp3", "flac", default: "mp3")', 'mp3')
  .option('--tracklist <file>', 'specify a tracklist file')
  .alias('d')
  .action((queries, options) => {
    console.log('Download command called with queries:', queries, 'and options:', options);

    if (options.tracklist) {
      const tracklistPath = path.resolve(options.tracklist);

      try {
        const tracklistContent = fs.readFileSync(tracklistPath, 'utf-8');
        const tracklistQueries = tracklistContent.split('\n').map(line => line.trim()).filter(line => line !== '');

        queries = queries.concat(tracklistQueries);
      } catch (err) {
        console.error(`Error reading tracklist file ${tracklistPath}: ${err.message}`);
        process.exit(1);
      }
    }

    console.log('Final queries after including tracklist:', queries);
    new DownloadCommand(queries, options); // Pass the merged queries to DownloadCommand
  });

program
  .command('query [query...]')
  .description('Search with required query, but don\'t download anything')
  .option('-q, --quality <quality>', 'show only mp3 with a defined quality')
  .option('-m, --mode <mode>', 'filter the kind of files you want (available: "mp3", "flac", default: "mp3")', 'mp3')
  .alias('q')
  .action((queries, options) => {
    console.log('Query command called with queries:', queries, 'and options:', options);
    new QueryCommand(queries, options);
  });

program
  .command('login')
  .alias('l')
  .action(() => {
    console.log('Login command called');
    new LoginCommand();
  });

program.parse(process.argv);

console.log('Finished parsing commands');
