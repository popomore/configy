var fs = require('fs');
var path = require('path');

var parser = {};

// support parser type
var TYPE = [
  'properties',
  'ini',
  'ymal'
];

var EXT = {
  'properties': 'properties',
  'ini': 'ini',
  'ymal': 'ymal'
};

for (i in TYPE) {
  parser[TYPE[i]] = require('./parser/' + TYPE[i] + '.js');
}

exports.file = function(filepath, type) {
  // 1. create file if file not exist
  fs.closeSync(fs.openSync(filepath, 'a'));

  // 2. check type
  if (!(type && TYPE.indexOf(type) > -1)) {
    var ext = path.extname(filepath).substring(1);
    type = EXT[ext] ? EXT[ext] : 'properties';
  }

  // 3. parser instantiation
  return new parser[type](filepath);
};

exports.parse = function(str, type) {
  type = (TYPE.indexOf(type) > -1) ? type : 'properties';
  return parser[type].parse(str);
};

