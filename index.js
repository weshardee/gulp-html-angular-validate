'use strict';

var gutil = require('gulp-util');
var path = require('path');
var pluginName = require('./package').name;
var through = require('through2');
var htmlValidate = require('html-angular-validate');

function validate(file, options, cb) {
  var self = this;
  var optionsCopy = JSON.parse(JSON.stringify(options));
  
  htmlValidate.validate(file.path, optionsCopy).then(function(result) {
    self.push(file);
    if (result.allpassed) {
      cb();
    } else {
      gutil.log(gutil.colors.red('Found validation failures'));
      for (var i = 0; i < result.failed.length; i++) {
        var fileResult = result.failed[i];
        gutil.log(gutil.colors.yellow(fileResult.filepath));
        for (var j = 0; j < fileResult.errors.length; j++) {
          var err = fileResult.errors[j];
          if (err.line !== undefined) {
            gutil.log(gutil.colors.red('  --[' +
              err.line +
              ':' +
              err.col +
              '] ' +
              err.msg));
          } else {
            gutil.log(gutil.colors.red('  --[fileResult] ' +
              err.msg));
          }
        }
      }
      cb(false);
    }
  }, function(err) { // Unable to validate files
    gutil.log(gutil.colors.red('htmlangular error: ' + err));
    cb(err);
  });
};

module.exports = function (options) {
  options = options || {};

  var stream = through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb();
    }
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(pluginName, 'Streams are not supported!'));
      return cb();
    }
    if (file.isBuffer()) {
      validate.call(this, file, options, cb);
    }
  });
  return stream;
}
