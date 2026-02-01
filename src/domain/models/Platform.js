/**
 * Modelo de plataforma de venda
 */
class Platform {
  constructor({ id, nome, taxaVenda, porcentagemComissao }) {
    this.id = id;
    this.nome = nome;
    this.taxaVenda = parseFloat(taxaVenda);
    this.porcentagemComissao = parseFloat(porcentagemComissao);
  }

  /**
   * Valida os dados da plataforma
   */
  isValid() {
    return (
      this.nome &&
      this.nome.trim().length > 0 &&
      !isNaN(this.taxaVenda) &&
      this.taxaVenda >= 0 &&
      !isNaN(this.porcentagemComissao) &&
      this.porcentagemComissao >= 0
    );
  }
}

module.exports = Platform;