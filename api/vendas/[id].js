/**
 * Serverless function para rotas de vendas com ID
 * Vercel Functions handler
 */

const cors = require('cors');
const { initializeDatabase } = require('../src/database/connection');
const PlatformRepository = require('../src/repositories/PlatformRepository');
const SaleRepository = require('../src/repositories/SaleRepository');
const SaleController = require('../src/controllers/SaleController');

// Configuração CORS
const corsMiddleware = cors();

// Inicializa repositórios e controllers
let saleController = null;

async function initializeApp() {
  if (!saleController) {
    await initializeDatabase();
    const platformRepository = new PlatformRepository();
    const saleRepository = new SaleRepository();
    saleController = new SaleController(saleRepository, platformRepository);
    await platformRepository.seedData();
  }
}

module.exports = async (req, res) => {
  // Configura CORS manualmente
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde imediatamente a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Configura headers adicionais
  res.setHeader('Content-Type', 'application/json');

  try {
    // Inicializa aplicação
    await initializeApp();

    // Extrai ID da URL
    const { id } = req.query;
    req.params = { id };

    // Parse do body se necessário
    if (req.method !== 'GET') {
      req.body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    const method = req.method;
    const controller = saleController;

    // Roteamento baseado no método HTTP
    switch (method) {
      case 'GET':
        await controller.findById(req, res);
        break;
      case 'PUT':
        await controller.update(req, res);
        break;
      case 'DELETE':
        await controller.delete(req, res);
        break;
      default:
        res.status(405).json({ mensagem: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na função serverless:', error);
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor',
      erro: error.message 
    });
  }
};