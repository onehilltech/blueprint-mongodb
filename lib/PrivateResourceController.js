'use strict';

module.exports = PrivateResourceController;

const blueprint        = require ('@onehilltech/blueprint')
  , ResourceController = require ('./ResourceController')
  ;

const DEFAULT_OWNER_PATH = 'user';

function PrivateResourceController (opts) {
  ResourceController.call (this, opts);

  this._ownerPath = opts.ownerPath || DEFAULT_OWNER_PATH;
  this._getOwner = opts.getOwner || __getOwner;

  if (!opts.isOwner)
    throw new Error ('Missing isOwner property');

  this._isOwner = opts.isOwner;
}

blueprint.controller (PrivateResourceController, ResourceController);

/**
 * Get a single contribution. The current user must be the owner of the
 * resource to retrieve it.
 *
 * @returns {*}
 */
PrivateResourceController.prototype.get = function () {
  return ResourceController.prototype.get.call (this, {
    on: {
      prepareFilter: this.prepareFilterForOwner ()
    }
  });
};

/**
 * Get all the resources for the current user.
 *
 * @returns {*}
 */
PrivateResourceController.prototype.getAll = function () {
  return ResourceController.prototype.getAll.call (this, {
    on: {
      prepareFilter: this.prepareFilterForOwner ()
    }
  });
};

/**
 * Update a single resource. The resource can only be updated by the
 * owner of the resource.
 *
 * @returns {*}
 */
PrivateResourceController.prototype.update = function () {
  var opts = {
    on: {
      authorize: this.isOwner (),
      updateFilter: this.prepareFilterForOwner ()
    }
  };

  return ResourceController.prototype.update.call (this, opts);
};

/**
 * Delete a single resource. The resource can only be deleted by the
 * owner of the resource.
 *
 * @returns {*}
 */
PrivateResourceController.prototype.delete = function () {
  var opts = {
    on: {
      authorize: this.isOwner (),
      updateFilter: this.prepareFilterForOwner ()
    }
  };

  return ResourceController.prototype.delete.call (this, opts);
};

PrivateResourceController.prototype.prepareFilterForOwner = function () {
  var self = this;

  return function (req, filter, callback) {
    filter[self._ownerPath] = self._getOwner (req);
    return callback (null, filter);
  }
};

PrivateResourceController.prototype.isOwner = function () {
  return this._isOwner;
};

function __getOwner (req) {
  return req.user._id;
}
