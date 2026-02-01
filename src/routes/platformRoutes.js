const express = require('express');
const router = express.Router();

/**
 * Configura as rotas de plataformas
 * @param {PlatformController} platformController - Controller de plataformas
 */
function setupPlatformRoutes(platformController) {
  router.post('/', (req, res) => platformController.create(req, res));
  router.get('/', (req, res) => platformController.listAll(req, res));
  router.get('/:id', (req, res) => platformController.findById(req, res));
  router.put('/:id', (req, res) => platformController.update(req, res));
  router.delete('/:id', (req, res) => platformController.delete(req, res));

  return router;
}

module.exports = setupPlatformRoutes;