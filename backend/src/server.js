const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database
const { initializeDatabase } = require('./database/connection');

// Repositories
const PlatformRepository = require('./repositories/PlatformRepository');
const SaleRepository = require('./repositories/SaleRepository');

// Controllers
const PlatformController = require('./controllers/PlatformController');
const SaleController = require('./controllers/SaleController');

// Routes
const setupPlatformRoutes = require('./routes/platformRoutes');
const setupSaleRoutes = require('./routes/saleRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize repositories
const platformRepository = new PlatformRepository();
const saleRepository = new SaleRepository();

// Initialize controllers
const platformController = new PlatformController(platformRepository);
const saleController = new SaleController(saleRepository, platformRepository);

// Setup routes
app.use('/api/plataformas', setupPlatformRoutes(platformController));
app.use('/api/vendas', setupSaleRoutes(saleController));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', mensagem: 'Servidor rodando' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    mensagem: 'Erro interno do servidor',
    erro: err.message 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}`);
  
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Popular dados iniciais de plataformas
    await platformRepository.seedData();
    
    console.log('✅ Aplicação iniciada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
  }
});

module.exports = app;