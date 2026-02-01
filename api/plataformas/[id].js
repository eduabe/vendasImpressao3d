/**
 * Serverless function para rotas de plataformas com ID
 * Vercel Functions handler
 */

const cors = require('cors');
const { query } = require('../../src/database/connection');
const PlatformRepository = require('../../src/repositories/PlatformRepository');
const PlatformController = require('../../src/controllers/PlatformController');

// Configuração CORS
const corsMiddleware = cors();

// Inicializa repositórios e controllers
let platformController = null;

async function initializeApp() {
  if (!platformController) {
    const platformRepository = new PlatformRepository(query);
    platformController = new PlatformController(platformRepository);
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
    const controller = platformController;

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