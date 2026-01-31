const express = require('express');
const router = express.Router();

/**
 * Configura as rotas de vendas
 * @param {SaleController} saleController - Controller de vendas
 */
function setupSaleRoutes(saleController) {
  router.post('/', (req, res) => saleController.create(req, res));
  router.get('/', (req, res) => saleController.listAll(req, res));
  router.get('/:id', (req, res) => saleController.findById(req, res));
  router.put('/:id', (req, res) => saleController.update(req, res));
  router.delete('/:id', (req, res) => saleController.delete(req, res));

  return router;
}

module.exports = setupSaleRoutes;