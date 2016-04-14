var request = require('supertest');
describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('./server.js');
  });
  afterEach(function () {
    // server.close();
  });
  it('responds to /', function testSlash(done) {
  request(server)
    .get('/')
    .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
  it('login without login', function testPath(done) {
    request(server)
      .put('/api/me')
      .expect(401, done);
  });
  it('logged in', function(done) {
    request(server)
      .post('/auth/login_admin')
      .send({
        "email": "marius_oscar@live.no",
        "password": "aristoteles"
      })
      .expect(200,done)
  });

});
