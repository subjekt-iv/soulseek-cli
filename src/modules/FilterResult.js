import path from 'path';
import _ from 'lodash';
const pluralize = (noun, count, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

export default function (qualityFilter, mode) {
  console.log('Initializing FilterResult with:', { qualityFilter, mode });
  this.qualityFilter = qualityFilter;
  this.mode = mode;

  /**
   * From the query results, only get mp3 with free slots.
   * The fastest results are going to be first.
   *
   * @param res
   * @return {array}
   */
  this.filter = (res) => {
    console.log('Filtering results:', res);

    res = filterByFreeSlot(res);
    console.log('After filtering by free slot:', res);

    if (this.mode === 'mp3') {
      res = keepOnlyMp3(res);
      console.log('After keeping only mp3:', res);
    }

    if (this.mode === 'flac') {
      res = keepOnlyFlac(res);
      console.log('After keeping only flac:', res);
    }

    if (this.qualityFilter) {
      res = filterByQuality(this.qualityFilter, res);
      console.log('After filtering by quality:', res);
    }

    res = sortBySpeed(res);
    console.log('After sorting by speed:', res);

    const filesByUser = getFilesByUser(res);
    console.log('Final files by user:', filesByUser);
    return filesByUser;
  };
}

/**
 * Discard all results without free slots
 * @param {array} res
 * @returns {array}
 */
let filterByFreeSlot = (res) => {
  const filtered = res.filter((r) => r.slots === true && r.speed > 0);
  console.log('Filtered by free slot:', filtered);
  return filtered;
};

/**
 * Remove everything that is not an mp3
 * @param {array} res
 * @returns {array}
 */
let keepOnlyMp3 = (res) => {
  const filtered = res.filter((r) => path.extname(r.file) === '.mp3');
  console.log('Filtered to keep only mp3:', filtered);
  return filtered;
};

/**
 * Remove everything that is not a flac
 * @param {array} res
 * @returns {array}
 */
let keepOnlyFlac = (res) => {
  const filtered = res.filter((r) => path.extname(r.file) === '.flac');
  console.log('Filtered to keep only flac:', filtered);
  return filtered;
};

/**
 * If a quality filter is defined, keep only the folders with the defined bitrate
 * @param {string} qualityFilter
 * @param {array} res
 * @returns {array}
 */
let filterByQuality = (qualityFilter, res) => {
  const filtered = res.filter((r) => r.bitrate === parseInt(qualityFilter, 10));
  console.log('Filtered by quality:', filtered);
  return filtered;
};

/**
 * Display the fastest results first
 * @param {array} res
 */
let sortBySpeed = (res) => {
  const sorted = res.sort((a, b) => b.speed - a.speed);
  console.log('Sorted by speed:', sorted);
  return sorted;
};

/**
 * Compute the average bitrate of a folder
 * @param {array} files
 * @returns {Number}
 */
let getAverageBitrate = (files) => {
  let averageBitrate = 0;

  if (files.length > 0) {
    const sum = files.reduce((a, b) => a + b.bitrate, 0);
    averageBitrate = Math.round(sum / files.length);
  }

  console.log('Average bitrate calculated:', averageBitrate);
  return averageBitrate;
};

/**
 * Compute the size of a folder in megabytes
 * @param {array} files
 * @returns {Number}
 */
let getFolderSize = (files) => {
  let size = 0;

  if (files.length > 0) {
    size = Math.round(files.reduce((a, b) => a + b.size, 0) / 1024 / 1024);
  }

  console.log('Folder size calculated:', size);
  return size;
};

/**
 * Get the speed of the remote peer
 * @param {array} files
 * @returns {Number}
 */
let getSpeed = (files) => {
  let speed = 0;

  if (files.length > 0) {
    speed = Math.round(files[0].speed / 1024);
  }

  console.log('Speed calculated:', speed);
  return speed;
};

/**
 * Build the result list
 * @param {array} res
 * @returns {object}
 */
let getFilesByUser = (res) => {
  let filesByUser = {};

  const rawFilesByUser = _.groupBy(res, (r) => {
    const resFileStructure = r.file.split('\\');
    const resDirectory = resFileStructure[resFileStructure.length - 2];
    return resDirectory + ' - ' + r.user;
  });

  console.log('Grouped files by user:', rawFilesByUser);

  for (const prop in rawFilesByUser) {
    let extraInfo = [];

    // Number of files
    extraInfo.push(`${pluralize('file', rawFilesByUser[prop].length)}`);

    // Bitrate
    const bitrate = getAverageBitrate(rawFilesByUser[prop]);
    if (bitrate) {
      extraInfo.push(`bitrate: ${bitrate}kbps`);
    }

    // Size
    extraInfo.push(`size: ${getFolderSize(rawFilesByUser[prop])}mb`);

    // Speed
    extraInfo.push(`speed: ~${getSpeed(rawFilesByUser[prop])}kb/s`);

    filesByUser[`${prop} (${extraInfo.join(', ')})`] = rawFilesByUser[prop];
  }

  console.log('Final files by user with extra info:', filesByUser);
  return filesByUser;
};
