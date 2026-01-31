const { query } = require('../database/connection');

/**
 * Repositório de Plataformas
 * Implementação com PostgreSQL
 */
class PlatformRepository {
  /**
   * Cria uma nova plataforma
   * @param {Platform} platform - Objeto plataforma
   * @returns {Promise<Platform>} Plataforma criada
   */
  async create(platform) {
    const result = await query(
      `INSERT INTO plataformas (nome, taxa_venda, porcentagem_comissao)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [platform.nome, platform.taxaVenda, platform.porcentagemComissao]
    );
    return this.mapFromDb(result.rows[0]);
  }

  /**
   * Busca todas as plataformas
   * @returns {Promise<Array<Platform>>} Lista de plataformas
   */
  async findAll() {
    const result = await query('SELECT * FROM plataformas ORDER BY nome');
    return result.rows.map(row => this.mapFromDb(row));
  }

  /**
   * Busca uma plataforma por ID
   * @param {string} id - ID da plataforma
   * @returns {Promise<Platform|null>} Plataforma encontrada ou null
   */
  async findById(id) {
    const result = await query('SELECT * FROM plataformas WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapFromDb(result.rows[0]);
  }

  /**
   * Atualiza uma plataforma
   * @param {string} id - ID da plataforma
   * @param {Partial<Platform>} data - Dados para atualizar
   * @returns {Promise<Platform|null>} Plataforma atualizada ou null
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramCount}`);
      values.push(data.nome);
      paramCount++;
    }

    if (data.taxaVenda !== undefined) {
      fields.push(`taxa_venda = $${paramCount}`);
      values.push(data.taxaVenda);
      paramCount++;
    }

    if (data.porcentagemComissao !== undefined) {
      fields.push(`porcentagem_comissao = $${paramCount}`);
      values.push(data.porcentagemComissao);
      paramCount++;
    }

    if (fields.length === 0) return await this.findById(id);

    values.push(id);

    const result = await query(
      `UPDATE plataformas SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return null;
    return this.mapFromDb(result.rows[0]);
  }

  /**
   * Remove uma plataforma
   * @param {string} id - ID da plataforma
   * @returns {Promise<boolean>} True se removida, false se não encontrada
   */
  async delete(id) {
    const result = await query('DELETE FROM plataformas WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  /**
   * Popula o banco de dados com dados iniciais
   */
  async seedData() {
    const existingCount = await query('SELECT COUNT(*) FROM plataformas');
    if (parseInt(existingCount.rows[0].count) > 0) {
      console.log('📊 Plataformas já cadastradas, pulando seed');
      return;
    }

    const seedPlatforms = [
      { nome: 'Shopee', taxaVenda: 5.00, porcentagemComissao: 12.00 },
      { nome: 'Mercado Livre', taxaVenda: 6.00, porcentagemComissao: 15.00 },
      { nome: 'Instagram', taxaVenda: 0.00, porcentagemComissao: 0.00 },
      { nome: 'Direto', taxaVenda: 0.00, porcentagemComissao: 0.00 },
      { nome: 'WhatsApp', taxaVenda: 0.00, porcentagemComissao: 0.00 }
    ];

    console.log('🌱 Inserindo plataformas iniciais...');
    for (const platform of seedPlatforms) {
      await this.create(platform);
    }
    console.log(`✅ ${seedPlatforms.length} plataformas inseridas`);
  }

  /**
   * Mapeia o resultado do banco de dados para o modelo de negócio
   * @param {Object} row - Linha do banco de dados
   * @returns {Platform} Plataforma mapeada
   */
  mapFromDb(row) {
    return {
      id: row.id,
      nome: row.nome,
      taxaVenda: parseFloat(row.taxa_venda),
      porcentagemComissao: parseFloat(row.porcentagem_comissao)
    };
  }
}

module.exports = PlatformRepository;