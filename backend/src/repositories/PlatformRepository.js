/**
 * Repositório de Plataformas
 * Implementação em memória, pronta para ser substituída por PostgreSQL
 */
class PlatformRepository {
  constructor() {
    this.platforms = [];
    this.seedData();
  }

  /**
   * Popula o repositório com dados iniciais
   */
  seedData() {
    const seedPlatforms = [
      { id: '1', nome: 'Shopee', taxaVenda: 5.00, porcentagemComissao: 12.00 },
      { id: '2', nome: 'Mercado Livre', taxaVenda: 6.00, porcentagemComissao: 15.00 },
      { id: '3', nome: 'Instagram', taxaVenda: 0.00, porcentagemComissao: 0.00 },
      { id: '4', nome: 'Direto', taxaVenda: 0.00, porcentagemComissao: 0.00 },
      { id: '5', nome: 'WhatsApp', taxaVenda: 0.00, porcentagemComissao: 0.00 }
    ];
    this.platforms = seedPlatforms;
  }

  /**
   * Cria uma nova plataforma
   * @param {Platform} platform - Objeto plataforma
   * @returns {Platform} Plataforma criada
   */
  create(platform) {
    const newPlatform = { ...platform, id: this.generateId() };
    this.platforms.push(newPlatform);
    return newPlatform;
  }

  /**
   * Busca todas as plataformas
   * @returns {Array<Platform>} Lista de plataformas
   */
  findAll() {
    return [...this.platforms];
  }

  /**
   * Busca uma plataforma por ID
   * @param {string} id - ID da plataforma
   * @returns {Platform|null} Plataforma encontrada ou null
   */
  findById(id) {
    return this.platforms.find(p => p.id === id) || null;
  }

  /**
   * Atualiza uma plataforma
   * @param {string} id - ID da plataforma
   * @param {Partial<Platform>} data - Dados para atualizar
   * @returns {Platform|null} Plataforma atualizada ou null
   */
  update(id, data) {
    const index = this.platforms.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.platforms[index] = { ...this.platforms[index], ...data };
    return this.platforms[index];
  }

  /**
   * Remove uma plataforma
   * @param {string} id - ID da plataforma
   * @returns {boolean} True se removida, false se não encontrada
   */
  delete(id) {
    const index = this.platforms.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.platforms.splice(index, 1);
    return true;
  }

  /**
   * Gera um ID único
   * @returns {string} ID gerado
   */
  generateId() {
    return `plataforma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = PlatformRepository;