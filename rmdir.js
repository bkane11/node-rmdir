var fs = require('fs')
, defaultcallback = function(){ return console.log('rmdir complete, with arguments:', arguments); }
;

var rmDirAsync = function(path, callback) {
	callback = callback || defaultcallback;
	fs.readdir(path, function(err, files) {
		if(err) {
			// Pass the error on to callback
			callback(err, []);
			return;
		}
		var wait = files.length,
			count = 0,
			folderDone = function(err) {
			count++;
			// If we cleaned out all the files, continue
			if( count >= wait || err) {
				fs.rmdir(path, callback);
			}
		};

		// Empty directory so bail
		if(!wait) {
			folderDone();
			return callback();
		}
		
		// Remove one or more trailing slash to keep from doubling up
		path = path.replace(/\/+$/,"");
		files.forEach(function(file) {
			var curPath = path + "/" + file;
			fs.lstat(curPath, function(err, stats) {
				if( err ) {
					callback(err, []);
					return;
				}
				if( stats.isDirectory() ) {
					rmdirAsync(curPath, folderDone);
				} else {
					fs.unlink(curPath, folderDone);
				}
			});
		});
	});
};

var rmDirSync = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports.async = rmDirAsync;
module.exports.sync = rmDirSync;
