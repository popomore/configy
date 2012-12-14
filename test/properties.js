var should = require('should');
var configr = require('../lib/configr');

describe('Configr', function() {
  it('should get correct properties', function() {
    var parser = configr.file(process.cwd() + '/test/data/get.properties');
    parser.get('website').should.eql('http://en.wikipedia.org/');
    parser.get('language').should.eql('English');
    parser.get('Nodejs').should.eql('a platform built on Chrome\'s JavaScript runtime for easily building fast, scalable network applications.');
    parser.get('message').should.eql('Welcome to Wikipedia!');
    parser.get('key with spaces').should.eql('This is the value that could be looked up with the key "key with spaces".');
    parser.get('tab').should.eql('\t');
    parser.get('quote').should.eql('"\'\'"');
  });
});

