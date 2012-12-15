var should = require('should');
var sinon = require('sinon');
var fs = require('fs');
var configr = require('../lib/configr');
var baseDir = process.cwd();

describe('Configr', function() {

  var tmp;

  afterEach(function() {
    if (tmp && fs.existsSync(tmp)) {
      fs.unlinkSync(tmp);
    }
  });

  it('should get correct ini', function() {
    var parser = configr.file(baseDir + '/test/data/get.ini');
    parser.get('a').should.eql('1');
    parser.get('section1.b').should.eql('1');
    parser.get('section1.c').should.eql('1');
    parser.get('section 2.d').should.eql('1');
    parser.get('section 2.e').should.eql('1');
  });

  it('should set correct ini', function(done) {
    tmp = baseDir + '/test/data/set.ini';
    var parser = configr.file(tmp);
    parser
      .set('a', '1')
      .set('a.b', '1')
      .set('b.a', '1');

    setTimeout(function() {
      fs.existsSync(tmp).should.be.true;
      fs.readFileSync(tmp).toString()
        .should.eql('a = 1\n[a]\nb = 1\n[b]\na = 1\n');
      done();
    }, 100);
  });
});
