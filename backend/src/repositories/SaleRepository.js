const { query } = require('../database/connection');

/**
 * Repositório de Vendas
 * Implementação com PostgreSQL
 */
class SaleRepository {
  /**
   * Cria uma nova venda
   * @param {Sale} sale - Objeto venda
   * @returns {Promise<Sale>} Venda criada
   */
  async create(sale) {
    const result = await query(
      `INSERT INTO vendas (
         valor_recebido, custo_impressao, custo_venda_plataforma, 
         custo_envio, plataforma_id, origem_venda, status, 
         data_cadastro, descricao, lucro_liquido, comissao_total
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        sale.valorRecebido,
        sale.custoImpressao,
        sale.custoVendaPlataforma,
        sale.custoEnvio,
        sale.plataformaId,
        sale.origemVenda,
        sale.status,
        sale.dataCadastro || new Date(),
        sale.descricao,
        sale.lucroLiquido,
        sale.comissaoTotal || 0
      ]
    );
    return this.mapFromDb(result.rows[0]);
  }

  /**
   * Busca todas as vendas
   * @returns {Promise<Array<Sale>>} Lista de vendas
   */
  async findAll() {
    const result = await query('SELECT * FROM vendas ORDER BY data_cadastro DESC');
    return result.rows.map(row => this.mapFromDb(row));
  }

  /**
   * Busca vendas com filtros
   * @param {Object} filters - Filtros aplicáveis
   * @returns {Promise<Array<Sale>>} Lista de vendas filtrada
   */
  async findByFilters(filters = {}) {
    const conditions = [];
    const params = [];
    let paramCount = 1;

    // Filtro por status
    if (filters.status) {
      conditions.push(`status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    // Filtro por origem da venda
    if (filters.origemVenda) {
      conditions.push(`origem_venda ILIKE $${paramCount}`);
      params.push(`%${filters.origemVenda}%`);
      paramCount++;
    }

    // Filtro por plataforma
    if (filters.plataformaId) {
      conditions.push(`plataforma_id = $${paramCount}`);
      params.push(filters.plataformaId);
      paramCount++;
    }

    // Filtro por range de datas
    if (filters.dataInicio) {
      conditions.push(`data_cadastro >= $${paramCount}`);
      params.push(filters.dataInicio);
      paramCount++;
    }

    if (filters.dataFim) {
      conditions.push(`data_cadastro <= $${paramCount}`);
      params.push(filters.dataFim);
      paramCount++;
    }

    // Construir WHERE clause
    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Ordenação
    const ordenarPor = filters.ordenarPor || 'data_cadastro';
    const ordem = filters.ordem === 'asc' ? 'ASC' : 'DESC';
    const orderClause = `ORDER BY ${ordenarPor} ${ordem}`;

    const sql = `SELECT * FROM vendas ${whereClause} ${orderClause}`;
    
    const result = await query(sql, params);
    return result.rows.map(row => this.mapFromDb(row));
  }

  /**
   * Busca uma venda por ID
   * @param {string} id - ID da venda
   * @returns {Promise<Sale|null>} Venda encontrada ou null
   */
  async findById(id) {
    const result = await query('SELECT * FROM vendas WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapFromDb(result.rows[0]);
  }

  /**
   * Atualiza uma venda
   * @param {string} id - ID da venda
   * @param {Partial<Sale>} data - Dados para atualizar
   * @returns {Promise<Sale|null>} Venda atualizada ou null
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.valorRecebido !== undefined) {
      fields.push(`valor_recebido = $${paramCount}`);
      values.push(data.valorRecebido);
      paramCount++;
    }

    if (data.custoImpressao !== undefined) {
      fields.push(`custo_impressao = $${paramCount}`);
      values.push(data.custoImpressao);
      paramCount++;
    }

    if (data.custoVendaPlataforma !== undefined) {
      fields.push(`custo_venda_plataforma = $${paramCount}`);
      values.push(data.custoVendaPlataforma);
      paramCount++;
    }

    if (data.custoEnvio !== undefined) {
      fields.push(`custo_envio = $${paramCount}`);
      values.push(data.custoEnvio);
      paramCount++;
    }

    if (data.plataformaId !== undefined) {
      fields.push(`plataforma_id = $${paramCount}`);
      values.push(data.plataformaId);
      paramCount++;
    }

    if (data.origemVenda !== undefined) {
      fields.push(`origem_venda = $${paramCount}`);
      values.push(data.origemVenda);
      paramCount++;
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(data.status);
      paramCount++;
    }

    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramCount}`);
      values.push(data.descricao);
      paramCount++;
    }

    if (data.lucroLiquido !== undefined) {
      fields.push(`lucro_liquido = $${paramCount}`);
      values.push(data.lucroLiquido);
      paramCount++;
    }

    if (data.comissaoTotal !== undefined) {
      fields.push(`comissao_total = $${paramCount}`);
      values.push(data.comissaoTotal);
      paramCount++;
    }

    if (fields.length === 0) return await this.findById(id);

    values.push(id);

    const result = await query(
      `UPDATE vendas SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return null;
    return this.mapFromDb(result.rows[0]);
  }

  /**
   * Remove uma venda
   * @param {string} id - ID da venda
   * @returns {Promise<boolean>} True se removida, false se não encontrada
   */
  async delete(id) {
    const result = await query('DELETE FROM vendas WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  /**
   * Mapeia o resultado do banco de dados para o modelo de negócio
   * @param {Object} row - Linha do banco de dados
   * @returns {Sale} Venda mapeada
   */
  mapFromDb(row) {
    return {
      id: row.id,
      valorRecebido: parseFloat(row.valor_recebido),
      custoImpressao: parseFloat(row.custo_impressao),
      custoVendaPlataforma: parseFloat(row.custo_venda_plataforma),
      custoEnvio: parseFloat(row.custo_envio),
      plataformaId: row.plataforma_id,
      origemVenda: row.origem_venda,
      status: row.status,
      dataCadastro: row.data_cadastro,
      descricao: row.descricao,
      lucroLiquido: parseFloat(row.lucro_liquido),
      comissaoTotal: parseFloat(row.comissao_total)
    };
  }
}

module.exports = SaleRepository;