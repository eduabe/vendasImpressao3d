const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}`);
});

module.exports = app;