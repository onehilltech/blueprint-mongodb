const request = require ('supertest')
  , blueprint = require ('@onehilltech/blueprint')
  , path      = require ('path')
  , async     = require ('async')
  , util      = require ('util')
  , expect    = require ('chai').expect
  , _         = require ('underscore')
  , testing   = require ('../../../lib/testing')
  , ConnectionManager = require ('../../../lib/ConnectionManager')
  ;

const datamodel = require (path.resolve (__dirname, '../../fixtures/datamodel'));

describe ('ResourceController', function () {
  var server = null;
  var person;

  before (function (done) {
    async.waterfall ([
      function (callback) {
        datamodel.apply (callback);
      },
      function (result, callback) {
        // Make sure the default connection is open.
        server = result[0].server;
        return callback (null);
      }
    ], done);
  });

  describe ('create', function () {
    it ('should create a resource', function (done) {
      var dob  = new Date ().toISOString();
      var data = {
        person: {
          first_name: 'John', last_name: 'Doe', age: 21, gender: 'Male', dob: dob,
          address: {
            street: 'Make Believe Lane',
            city: 'Magic',
            state: 'TN',
            zipcode: '12345'
          },
          education: datamodel.models.degrees[0].id,
          degrees: [
            datamodel.models.degrees[0].id,
            datamodel.models.degrees[1].id
          ]
        }
      };

      request (server.app)
        .post ('/person')
        .send (data)
        .expect (200)
        .end (function (err, res) {
          if (err) return done (err);

          person = res.body.person;
          data.person._id = person._id;

          // When we create the resource, it should only have the "created_at" property,
          // and not the "modified_at" property.
          expect (res.body).to.have.deep.property ('person._stat.created_at');
          expect (res.body).to.not.have.deep.property ('person._stat.modified_at');

          expect (_.omit (res.body.person, ['_stat'])).to.deep.equal (data.person);

          return done (null);
        }, done);
    });

    it ('should not create resource; missing parameters', function (done) {
      request (server.app)
        .post ('/person')
        .send ({person: {gender: 'Ok'}})
        .expect (400, [
          { param: "person.age", msg: "Invalid/missing Int"},
          { param: "person.gender", msg: "Expected [ 'Female', 'Male' ]", value: 'Ok'},
          { param: "person.dob", msg: "Invalid date format"},
          { param: 'person.address.street', msg: 'Invalid param' },
          { param: 'person.address.city', msg: 'Invalid param' },
          { param: 'person.address.state', msg: 'Invalid param' },
          { param: 'person.address.zipcode', msg: 'Invalid param' }
        ], done);
    });
  });

  describe ('get', function () {
    it ('should return a single person', function (done) {
      request (server.app)
        .get ('/person/' + person._id)
        .expect (200, done);
    });

    it ('should return a single person with a populated data', function (done) {
      request (server.app)
        .get ('/person/' + person._id)
        .query ({populate: true})
        .expect (200, {
          degrees: [
            _.extend (datamodel.data.degrees[0], {_id: datamodel.models.degrees[0].id}),
            _.extend (datamodel.data.degrees[1], {_id: datamodel.models.degrees[1].id})
          ],
          person: person
        }, done);
    });

    it ('should return a list of persons', function (done) {
      request (server.app)
        .get ('/person')
        .query ({options: {populate: true}})
        .expect (200, {
          people: [
            _.omit (testing.lean (datamodel.models.persons[0]), ['__v']),
            person
          ],

          degrees: [
            _.extend (datamodel.data.degrees[0], {_id: datamodel.models.degrees[0].id}),
            _.extend (datamodel.data.degrees[1], {_id: datamodel.models.degrees[1].id})
          ]
        }, done);
    });
  });

  describe ('update', function () {
    it ('should update a resource', function (done) {
      var data = {
        person: { first_name: 'James', last_name: 'Hill' }
      };

      request (server.app)
        .put ('/person/' + person._id)
        .send (data)
        .expect (200)
        .end (function (err, res) {
          if (err) return done (err);

          person.first_name = 'James';
          person.last_name = 'Hill';

          var updated = res.body.person;

          // Check the _stat fields.
          expect (updated).to.have.deep.property ('_stat.created_at', person._stat.created_at);
          expect (updated).to.have.deep.property ('_stat.updated_at');
          expect (updated._stat.created_at).to.not.equal (updated._stat.updated_at);

          expect (_.omit (res.body.person, ['_stat'])).to.deep.equal (_.omit (person, ['_stat']));
          return done (null);
        });
    });

    it ('should update resource, excluding unknown param', function (done) {
      var data = {
        person: { firstname: 'Jake', last_name: 'Williams'}
      };

      request (server.app)
        .put ('/person/' + person._id)
        .send (data)
        .expect (200)
        .end (function (err, res) {
          if (err) return done (err);

          person.last_name = 'Williams';

          var omits = ['_stat'];

          expect (_.omit (res.body.person, omits)).to.deep.equal (_.omit (person, omits));
          return done (null);
        });
    });
  });

  describe ('count', function () {
    it ('should count the number of resources', function (done) {
      request (server.app)
        .get ('/person/count')
        .expect (200, {count: 2}, done);
    });
  });
});
