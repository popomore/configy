var fs = require('fs');
var getKeys = require('../util').getKeys;

var property = /^\s*(.*?)\s*=\s*(.*?)\s*$/;
var comment = /^;\s*(.*)$/;
var section = /^\s*\[\s*(.*?)\s*\]\s*$/;

module.exports = iniParser;

function iniParser(filepath) {
  this.filepath = filepath;
  this.data = readFile(filepath);
}

iniParser.prototype = {
  __type: 'ini',

  data: {},

  get: function(key) {
    if (/\./.test(key)) {
      var section = key.split('.')[0], propertyKey = key.split('.')[1];
      return this.data[section][propertyKey] || '';
    } else {
      return this.data['__undefined'][key] || '';
    }
  },

  set: function(key, value) {
    if (isObject(key)) {
      var obj = key;
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          this.set(k, obj[k]);
        }
      }
    } else {
      if (!key || (typeof value === 'undefined')) return;

      if (/\./.test(key)) {
        var section = key.split('.')[0], propertyKey = key.split('.')[1];
        if (!this.data[section]) this.data[section] = {};
        this.data[section][propertyKey] = value;
      } else {
        this.data['__undefined'][key] = value;
      }
    }

    var that = this;
    clearTimeout(this._timeout);
    this._timeout = setTimeout(function() {
      writeFile(that.filepath, that.data);
    }, 80);
    return this;
  }
};

iniParser.parse = parse;

function parse(str) {
  var result = {'__undefined': {}}, root;
  var data = str.split(/\r\n|\r|\n/);
  for (var i = 0, l = data.length; i < l; i++) {
    var item = data[i];
    if (comment.test(item)) {
      // ignore
      continue;
    } else if (section.test(item)) {
      root = item.match(section)[1];
      result[root] = {}; // init new root
    } else {
      var r = item.match(property);
      if (r) {
        var k = r[1], v = r[2];
        result[root || '__undefined'][k] = v;
      }
    }
  }
  return result;
}

function readFile(filepath) {
  var data = fs.readFileSync(filepath);
  return parse(data.toString());
}

function writeFile(filepath, data) {
  var roots = getKeys(data);
  var a = [];
  for (var i in roots.sort()) {
    var root = roots[i];
    if (root !== '__undefined') {
      a.push('[' + root + ']');
    }
    var keys = getKeys(data[root]);
    for (var j in keys.sort()) {
      var key = keys[j];
      a.push(key + ' = ' + data[root][key]);
    }
  }
  a.push('');
  fs.writeFile(filepath, a.join('\n'), function(err) {});
}

function isObject(obj) {
  return typeof obj === 'object';
}
