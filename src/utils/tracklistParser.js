// Function to parse the tracklist file
const parseTracklist = (filePath) => {
    const fs = require('fs');
    const readline = require('readline');

    let tracklist = [];

    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        const [artist, title] = line.split(' - ');
        if (artist && title) {
            tracklist.push({ artist, title });
        }
    });

    rl.on('close', () => {
        console.log('Tracklist parsed successfully:');
        console.log(tracklist);
        // Call function to start downloading based on tracklist
        initiateTracklistDownload(tracklist);
    });

    rl.on('error', (err) => {
        console.error('Error reading tracklist file:', err);
    });
};

// Example usage
parseTracklist('./tracklist.txt');
