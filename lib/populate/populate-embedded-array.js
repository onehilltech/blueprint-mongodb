/*
 * Copyright (c) 2018 One Hill Technologies, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  isEmpty,
  flattenDeep,
  mapValues
} = require ('lodash');

const Populate = require ('./populate');
const BluebirdPromise = require ('bluebird');

/**
 * @class PopulateEmbeddedArray
 *
 * Populate the models of an embedded array of documents.
 */
module.exports = Populate.extend ({
  population: null,

  populated: null,

  accept (v) {
    v.visitPopulateEmbeddedArray (this);
  },

  populate (unseen) {
    let pending = mapValues (this.populators, (populator, name) => {
      const values = unseen[name];

      if (isEmpty (values))
        return null;

      const ids = flattenDeep (values);

      return populator.populate (ids).exec ();
    });

    return BluebirdPromise.props (pending);
  }
});
