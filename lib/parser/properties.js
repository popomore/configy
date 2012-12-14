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
    this.data[key.trim()] = value;

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
  var keys = getKeys(data);
  var a = [];
  for (var i in keys.sort()) {
    var key = keys[i];
    a.push(unescapeKey(key) + ' = ' + unescapeValue(data[key]));
  }
  a.push('');
  fs.writeFile(filepath, a.join('\n'), function(err) {

  });
}

var ESCAPE_SPACE = /\\(\s)/g;
function escapeKey(str) {
  return str.replace(/\\(\s)/g, '$1');
}

var UNESCAPE_SPACE = / /g;
function unescapeKey(str) {
  return str.replace(/ /g, '\\ ');
}

var ESCAPE_UNICODE = /\\(u[0-9]{4})/g;
function escapeValue(str) {
  if (ESCAPE_UNICODE.test(str)) {
    return unescape(str.replace(ESCAPE_UNICODE, '%$1'));
  } else {
    return str;
  }
}

function unescapeValue(str) {
  return str
    .replace(/(\f|\v|\0|\t|\n|\r)/g, function(str) {
      return '\\u000' + str.charCodeAt().toString(16).toUpperCase();
    })
    .trim();
}

var getKeys = (function() {
  var hasOwnProperty = Object.prototype.hasOwnProperty,
  hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
  dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
  ],
  dontEnumsLength = dontEnums.length;

  return function(obj) {
    if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null)
      throw new TypeError('Object.keys called on non-object');

    var result = [];

    for (var prop in obj) {
      if (hasOwnProperty.call(obj, prop)) result.push(prop);
    }

    if (hasDontEnumBug) {
      for (var i = 0; i < dontEnumsLength; i++) {
        if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
      }
    }
    return result;
  }
})();
