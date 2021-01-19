const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const zipDirectory = path.join(__dirname ,'..');
const finalPath = path.join(__dirname, '..', 'moomask.zip');

const output = fs.createWriteStream( finalPath );
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('end', function() {
  console.log('Zip completed');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.directory(zipDirectory + '/dist/', false);

archive.finalize();
