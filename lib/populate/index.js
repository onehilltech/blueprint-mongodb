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

const ModelRegistry = require ('./model-registry');
const Population = require ('./population');

function getModel (model) {
  let name = model.constructor.modelName;
  return model.db.models[name];
}

/**
 * Populate a model.
 *
 * @param   model       Model to populate.
 * @return  Promise <Population>
 */
function populateModel (model) {
  // Get the registered model type.
  const Model = getModel (model);

  // Create a new register, and add the root Model to it.
  const registry = new ModelRegistry ();
  registry.addModel (Model);

  // Create a new population for this registry. Then, add the
  // root model to the population.
  const population = new Population ({registry});
  return population.addModel (model).then (population => population.models);
}

/**
 * Populate an array of models.
 *
 * @param models
 */
function populateModels (models) {
  const registry = new ModelRegistry ();

  // Add the model types to the registry.
  models.forEach (model => {
    const Model = getModel (model);
    registry.addModel (Model);
  });

  // Create a new population for this registry. Then, add the
  // root model to the population.
  const population = new Population ({registry});
  return population.addModels (models).then (population => population.models);
}

exports.populateModel = populateModel;
exports.populateModels = populateModels;
