/**
 * Repositório de Vendas
 * Implementação em memória, pronta para ser substituída por PostgreSQL
 */
class SaleRepository {
  constructor() {
    this.sales = [];
  }

  /**
   * Cria uma nova venda
   * @param {Sale} sale - Objeto venda
   * @returns {Sale} Venda criada
   */
  create(sale) {
    const newSale = { ...sale, id: this.generateId() };
    this.sales.push(newSale);
    return newSale;
  }

  /**
   * Busca todas as vendas
   * @returns {Array<Sale>} Lista de vendas
   */
  findAll() {
    return [...this.sales];
  }

  /**
   * Busca vendas com filtros
   * @param {Object} filters - Filtros aplicáveis
   * @returns {Array<Sale>} Lista de vendas filtrada
   */
  findByFilters(filters) {
    let filtered = [...this.sales];

    // Filtro por status
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    // Filtro por origem da venda
    if (filters.origemVenda) {
      filtered = filtered.filter(s => 
        s.origemVenda.toLowerCase().includes(filters.origemVenda.toLowerCase())
      );
    }

    // Filtro por plataforma
    if (filters.plataformaId) {
      filtered = filtered.filter(s => s.plataformaId === filters.plataformaId);
    }

    // Filtro por range de datas
    if (filters.dataInicio) {
      const inicio = new Date(filters.dataInicio);
      filtered = filtered.filter(s => new Date(s.dataCadastro) >= inicio);
    }

    if (filters.dataFim) {
      const fim = new Date(filters.dataFim);
      fim.setHours(23, 59, 59, 999); // Incluir todo o dia
      filtered = filtered.filter(s => new Date(s.dataCadastro) <= fim);
    }

    // Ordenação
    if (filters.ordenarPor) {
      const ordem = filters.ordem === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        if (a[filters.ordenarPor] < b[filters.ordenarPor]) return -1 * ordem;
        if (a[filters.ordenarPor] > b[filters.ordenarPor]) return 1 * ordem;
        return 0;
      });
    }

    return filtered;
  }

  /**
   * Busca uma venda por ID
   * @param {string} id - ID da venda
   * @returns {Sale|null} Venda encontrada ou null
   */
  findById(id) {
    return this.sales.find(s => s.id === id) || null;
  }

  /**
   * Atualiza uma venda
   * @param {string} id - ID da venda
   * @param {Partial<Sale>} data - Dados para atualizar
   * @returns {Sale|null} Venda atualizada ou null
   */
  update(id, data) {
    const index = this.sales.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.sales[index] = { ...this.sales[index], ...data };
    return this.sales[index];
  }

  /**
   * Remove uma venda
   * @param {string} id - ID da venda
   * @returns {boolean} True se removida, false se não encontrada
   */
  delete(id) {
    const index = this.sales.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.sales.splice(index, 1);
    return true;
  }

  /**
   * Gera um ID único
   * @returns {string} ID gerado
   */
  generateId() {
    return `venda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = SaleRepository;