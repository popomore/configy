var fs = require('fs');
var Class = require('arale').Class;
var Events = require('arale').Events;
var getKeys = require('../util').getKeys;

var property = /^\s*(.*?)\s*(?::|=)\s*(.*?)\s*$/;
var comment = /^[#|!]\s*(.*)$/;

// http://en.wikipedia.org/wiki/.properties
var propertiesParser = module.exports = Class.create({
  __type: 'properties',

  Implements: Events,

  initialize: function(filepath) {
    this.filepath = filepath;
    this.data = readFile(filepath);
  },

  data: {},

  get: function(key) {
    return this.data[key] || '';
  },

  set: function(key, value) {
    if (isObject(key)) {
      var obj = key;
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          this.data[k] = obj[k];
        }
      }
    } else {
      if (!key || (typeof value === 'undefined')) return;
      this.data[key.trim()] = value;
    }

    var that = this;
    clearTimeout(this._timeout);
    this._timeout = setTimeout(function() {
      writeFile(that.filepath, that.data, function(err) {
        that.trigger('complete');
      });
    }, 80);
    return this;
  }
});

propertiesParser.parse = parse;

function parse(str) {
  var result = {}, data = str.split(/\r\n|\r|\n/);

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
        var r = item.match(property);
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

function readFile(filepath) {
  var data = fs.readFileSync(filepath);
  return parse(data.toString());
}

function writeFile(filepath, data, callback) {
  var keys = getKeys(data);
  var a = [];
  for (var i in keys.sort()) {
    var key = keys[i];
    a.push(unescapeKey(key) + ' = ' + unescapeValue(data[key]));
  }
  a.push('');
  fs.writeFile(filepath, a.join('\n'), callback);
}

// key should add slash before space
var ESCAPE_SPACE = /\\(\s)/g;
var UNESCAPE_SPACE = / /g;
function escapeKey(str) {
  return str.replace(/\\(\s)/g, '$1');
}
function unescapeKey(str) {
  return str.replace(/ /g, '\\ ');
}

// \u0009 => \t
var ESCAPE_UNICODE = /\\(u[0-9]{4})/g;
function escapeValue(str) {
  if (ESCAPE_UNICODE.test(str)) {
    return unescape(str.replace(ESCAPE_UNICODE, '%$1'));
  } else {
    return str;
  }
}

// \t => \u0009
// include \f \v \0 \t \n \r
function unescapeValue(str) {
  return (str + '')
    .replace(/(\f|\v|\0|\t|\n|\r)/g, function(str) {
      return '\\u000' + str.charCodeAt().toString(16).toUpperCase();
    })
    .trim();
}

function isObject(obj) {
  return typeof obj === 'object';
}
