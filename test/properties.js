var should = require('should');
var sinon = require('sinon');
var fs = require('fs');
var configy = require('../lib/configy');
var baseDir = process.cwd();

describe('Configy', function() {

  var tmp;

  afterEach(function() {
    if (tmp && fs.existsSync(tmp)) {
      fs.unlinkSync(tmp);
    }
  });

  it('should get correct properties', function() {
    var parser = configy.file(baseDir + '/test/data/get.properties');
    parser.get('website').should.eql('http://en.wikipedia.org/');
    parser.get('language').should.eql('English');
    parser.get('Nodejs').should.eql('a platform built on Chrome\'s JavaScript runtime for easily building fast, scalable network applications.');
    parser.get('message').should.eql('Welcome to Wikipedia!');
    parser.get('key with spaces').should.eql('This is the value that could be looked up with the key "key with spaces".');
    parser.get('tab').should.eql('\t');
    parser.get('quote').should.eql('"\'\'"');
  });

  it('should set correct properties', function(done) {
    tmp = baseDir + '/test/data/set.properties';
    var parser = configy.file(tmp);
    parser
      .set('website', 'http://en.wikipedia.org/')
      .set('key with spaces', 'This is the value that could be looked up with the key "key with spaces".')
      .set('tab', 'e\te')
      .set('return', 'e\re')
      .set('new line', 'e\ne')
      .set('form', 'e\fe')
      .set('vertical', 'e\ve')
      .set('null', 'e\0e')
      .set('   trim  ', '    need trim key and value   ');

    setTimeout(function() {
      fs.existsSync(tmp).should.be.true;
      fs.readFileSync(tmp).toString()
        .should.eql('form = e\\u000Ce\nkey\\ with\\ spaces = This is the value that could be looked up with the key "key with spaces".\nnew\\ line = e\\u000Ae\nnull = e\\u0000e\nreturn = e\\u000De\ntab = e\\u0009e\ntrim = need trim key and value\nvertical = e\\u000Be\nwebsite = http://en.wikipedia.org/\n');
      done();
    }, 100);
  });

  it('should set object', function(done) {
    tmp = baseDir + '/test/data/set.properties';
    var parser = configy.file(tmp);
    parser.set({
      a: '1',
      b: '2'
    });

    setTimeout(function() {
      fs.existsSync(tmp).should.be.true;
      fs.readFileSync(tmp).toString()
        .should.eql('a = 1\nb = 2\n');
      done();
    }, 100);
  });

  it('should call complete callback', function(done) {
    tmp = baseDir + '/test/data/set.properties';
    var parser = configy.file(tmp);
    var spy = sinon.spy();
    parser
      .on('complete', spy)
      .set({
        a: '1',
        b: '2'
      });

    setTimeout(function() {
      spy.calledOnce.should.be.true;
      done();
    }, 100);
  });

  it('should set properties async', function(done) {
    var writeFile = sinon.spy(fs, 'writeFile');
    tmp = baseDir + '/test/data/set.properties';
    var parser = configy.file(tmp)
      .set('a', 1)
      .set('b', 1)
      .set('c', 1)
      .set({d: 1, e: 1});

    setTimeout(function() {
      writeFile.calledOnce.should.be.true;
      done();
    }, 100);
  });
});

