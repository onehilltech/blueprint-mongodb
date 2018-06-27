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
  computed
} = require ('@onehilltech/blueprint');

const pluralize = require ('pluralize');
const Populate  = require ('./populate');

/**
 * @class PopulateElement
 *
 * Strategy for populating a single model element.
 */
module.exports = Populate.extend ({
  /// The model definition used to populate models.
  Model: null,

  plural: computed ({
    get () {
      return pluralize (this.Model.modelName);
    }
  }),

  /**
   * Populate the model for the given id.
   *
   * @param id
   * @returns {*}
   */
  populate (id) {
    return this.Model.findById (id);
  },

  accept (v) {
    v.visitPopulateElement (this);
  }
});
