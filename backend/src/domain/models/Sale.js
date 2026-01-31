/**
 * Modelo de venda
 */
class Sale {
  constructor({
    id,
    valorRecebido,
    custoImpressao,
    custoVendaPlataforma,
    custoEnvio,
    plataformaId,
    plataformaNome,
    origemVenda,
    status,
    dataCadastro,
    lucroLiquido,
    margemLucro,
    comissaoPlataformaTotal
  }) {
    this.id = id;
    this.valorRecebido = parseFloat(valorRecebido);
    this.custoImpressao = parseFloat(custoImpressao);
    this.custoVendaPlataforma = parseFloat(custoVendaPlataforma);
    this.custoEnvio = parseFloat(custoEnvio);
    this.plataformaId = plataformaId;
    this.plataformaNome = plataformaNome;
    this.origemVenda = origemVenda;
    this.status = status;
    this.dataCadastro = dataCadastro;
    this.lucroLiquido = lucroLiquido ? parseFloat(lucroLiquido) : null;
    this.margemLucro = margemLucro ? parseFloat(margemLucro) : null;
    this.comissaoPlataformaTotal = comissaoPlataformaTotal !== undefined ? parseFloat(comissaoPlataformaTotal) : null;
  }

  /**
   * Valida os dados da venda
   */
  isValid() {
    return (
      !isNaN(this.valorRecebido) &&
      this.valorRecebido >= 0 &&
      !isNaN(this.custoImpressao) &&
      this.custoImpressao >= 0 &&
      !isNaN(this.custoVendaPlataforma) &&
      this.custoVendaPlataforma >= 0 &&
      !isNaN(this.custoEnvio) &&
      this.custoEnvio >= 0 &&
      this.origemVenda &&
      this.origemVenda.trim().length > 0 &&
      this.status &&
      this.dataCadastro
    );
  }
}

module.exports = Sale;