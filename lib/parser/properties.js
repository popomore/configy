var fs = require('fs');

var match = /^\s*(.*?)\s*(?::|=)\s*(.*?)\s*$/;
var comment = /^[#|!]\s*(.*)$/;

module.exports = propertiesParser;

function propertiesParser(filepath) {
  this.filepath = filepath;
  this.data = readFile(filepath);
}

propertiesParser.prototype = {
  __type: 'properties',

  data: {},

  get: function(key) {
    return this.data[key] || '';
  },

  set: function(key, value) {
    if (!key || (typeof value === 'undefined')) return;
    this.data[key] = value;

    var that = this;
    clearTimeout(this._timeout);
    this._timeout = setTimeout(function() {
      writeFile(that.filepath, that.data);
    }, 80);
    return this;
  }
};

function readFile(filepath) {
  var result = {}, data = fs.readFileSync(filepath);
  data = data.toString().split(/\r\n|\r|\n/);

  for (var i = 0, l = data.length; i < l; i++) {
    var item = data[i];
    if (comment.test(item)) {
      // ignore
      continue;
    } else {
      if (this._slash) {
        var hasSlash = false;
        var k = this._slash.key;
        var v = this._slash.value;
        if (/\\\s*$/.test(item)) {
          this._slash.value = v + item.replace(/^\s*(.*)\\\s*$/g, '$1');
        } else {
          v = v + item.replace(/^\s*/g, '');
          result[escapeKey(k)] = escapeValue(v);
          delete this._slash;
        }
      } else {
        var r = item.match(match);
        if (r) {
          // set key/value
          var k = r[1], v = r[2];
          if (/\\$/.test(v)) {
            this._slash = {
              key: k,
              value: v.substring(0, v.length - 1)
            };
          } else {
            result[escapeKey(k)] = escapeValue(v);
          }
        }
      }
    }
  }
  return result;
}

function writeFile(filepath, data) {
  var a = [];
  for (var key in data) {
    a.push(key + ' = ' + data[key]);
  }
  a.push('');
  fs.writeFile(filepath, a.join('\n'), function(err) {

  });
}

var ESCAPE_SPACE = /\\(\s)/g;
function escapeKey(str) {
  return str.replace(/\\(\s)/g, '$1');
}

var ESCAPE_UNICODE = /\\(u[0-9]{4})/g;
function escapeValue(str) {
  if (ESCAPE_UNICODE.test(str)) {
    return unescape(str.replace(ESCAPE_UNICODE, '%$1'));
  } else {
    return str;
  }
}

var UNESCAPE_SPACE = / /g;
function unescapeKey(str) {
  return str.replace(/ /g, '\\ ');
}
