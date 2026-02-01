const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err);
});

/**
 * Executa uma query SQL
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Object>} Resultado da query
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executou query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

/**
 * Inicializa o banco de dados, criando as tabelas se não existirem
 */
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('🔧 Inicializando banco de dados...');
    
    // Ler e executar o script de criação de tabelas
    const fs = require('fs');
    const path = require('path');
    const createTablesPath = path.join(__dirname, '../../database/create_tables.sql');
    const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
    
    await client.query(createTablesSQL);
    console.log('✅ Tabelas criadas com sucesso');
    
    client.release();
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  initializeDatabase
};