const blueprint   = require ('@onehilltech/blueprint');
const { expect }  = require ('chai');
const { resolve } = require ('path');

const lean = require ('../../../../lib/lean');
const Population = require ('../../../../lib/populate/population');
const ModelRegistry = require ('../../../../lib/populate/model-registry');

describe ('lib | populate | Population', function () {
  beforeEach (function () {
    const appPath = resolve ('./tests/dummy/app');

    return blueprint.createApplicationAndStart (appPath)
      .then (() => Promise.all ([
        blueprint.lookup ('model:author').remove (),
        blueprint.lookup ('model:user').remove ()
      ]))
      .then (() => blueprint.lookup ('model:author').create ({name: 'John Doe'}))
      .then ((author) => blueprint.lookup ('model:user').create (
        [
          {first_name: 'Paul', last_name: 'Black', favorite_author: author._id},
          {first_name: 'John', last_name: 'Smith', favorite_author: author._id}
        ])
      );
  });

  afterEach (function () {
    return blueprint.destroyApplication ();
  });

  describe ('constructor', function () {
    it ('should create population with no types', function () {
      const registry = new ModelRegistry ();
      let population = new Population ({registry});

      expect (population).to.have.deep.property ('models', {});
      expect (population).to.have.deep.property ('ids', {});
    });

    it ('should create population with types', function () {
      const User = blueprint.lookup ('model:user');
      const registry = new ModelRegistry ();
      registry.addModel (User);

      let population = new Population ({registry});

      expect (population).to.have.deep.property ('models', {users: [], authors: []});
      expect (population).to.have.deep.property ('ids', {users: [], authors: []});
    });
  });

  describe ('addModels', function () {
    context ('do not save ids', function () {
      it ('should add models to the population', function () {
        const User = blueprint.lookup ('model:user');

        const registry = new ModelRegistry ();
        registry.addModel (User);

        const population = new Population ({registry});

        return User.find ().then (users => {
          population.addModels ('users', users);

          expect (lean (population.models)).to.eql ({authors: [], users: [lean (users)]});
          expect (population.ids).to.eql ({authors: [], users: []});
        });
      });
    });

    context ('save ids', function () {
      it ('should add models to population', function () {
        const User = blueprint.lookup ('model:user');

        const registry = new ModelRegistry ();
        registry.addModel (User);

        const population = new Population ({registry});

        return User.find ().then (users => {
          population.addModels ('users', users, true);

          expect (lean (population.models)).to.eql ({authors: [], users: [lean (users)]});
          expect (population.ids).to.eql ({authors: [], users: [[users[0]._id, users[1]._id]]});
        });
      });
    });
  });

  describe ('populateElement', function () {
    it ('should populate an element', function () {
      const User = blueprint.lookup ('model:user');
      const Author = blueprint.lookup ('model:author');

      const registry = new ModelRegistry ();

      registry.addModel (User);

      const population = new Population ({registry});
      const uKey = ModelRegistry.getKeyFromModel (User);

      const promises = [
        Author.find (),
        User.find (),
      ];

      return Promise.all (promises)
        .then (([authors, users]) => {
          const user = users[0];

          return population.populateElement (uKey, user)
            .then (() => {
              expect (population.ids).to.eql ({users: [], authors: [[authors[0]._id]]});
              expect (lean (population.models)).to.eql (lean ({users: [], authors: [authors]}));

            });
        })
        .then (() => {
        });
    });
  });

  describe ('populateArray', function () {
    it ('should populate an array', function () {
      const User = blueprint.lookup ('model:user');
      const Author = blueprint.lookup ('model:author');

      const registry = new ModelRegistry ();

      registry.addModel (User);

      const population = new Population ({registry});
      const uKey = ModelRegistry.getKeyFromModel (User);

      const promises = [
        Author.find (),
        User.find (),
      ];

      return Promise.all (promises)
        .then (([authors,users]) => {
          return population.populateArray (uKey, users)
            .then (() => {
              expect (population.ids).to.eql ({users: [], authors: [[authors[0]._id]]});
            });
        })
        .then (() => {
        });
    });
  });

  describe ('flatten', function () {
    it ('should flatten the population', function () {
      const User = blueprint.lookup ('model:user');

      const registry = new ModelRegistry ();
      registry.addModel (User);

      const population = new Population ({registry});

      return User.find ().then (users => {
        population.addModels ('users', users);

        let result = population.flatten ();

        expect (lean (result)).to.eql ({authors: [], users: lean (users)});
      });
    });
  });
});