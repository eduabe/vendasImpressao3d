/**
 * Serviço de domínio responsável pelo cálculo de lucro e margem
 * Este serviço não depende de Express, recebendo DTOs limpos
 */

/**
 * DTO para cálculo de lucro
 * @typedef {Object} ProfitCalculationDTO
 * @property {number} valorRecebido - Valor recebido pela venda
 * @property {number} custoImpressao - Custo do filamento/impressão
 * @property {number} taxaFixaPlataforma - Taxa fixa da plataforma
 * @property {number} porcentagemComissao - Porcentagem de comissão da plataforma (0-100)
 * @property {number} custoEnvio - Custo de envio (caixa, plástico bolha, etc)
 */

class ProfitCalculationService {
  /**
   * Calcula o lucro líquido de uma venda
   * @param {ProfitCalculationDTO} dto - Dados para cálculo
   * @returns {number} Lucro líquido
   */
  calculateProfit(dto) {
    const {
      valorRecebido,
      custoImpressao,
      taxaFixaPlataforma,
      porcentagemComissao,
      custoEnvio
    } = dto;

    // Validação básica
    this.validateInput(dto);

    // Cálculo da comissão da plataforma (percentual sobre o valor recebido)
    const comissaoPlataforma = (valorRecebido * porcentagemComissao) / 100;

    // Fórmula do lucro líquido:
    // Lucro = Valor Recebido - Comissão - Taxa Fixa - Custo Impressão - Custo Envio
    const lucroLiquido = valorRecebido
      - comissaoPlataforma
      - taxaFixaPlataforma
      - custoImpressao
      - custoEnvio;

    return parseFloat(lucroLiquido.toFixed(2));
  }

  /**
   * Calcula a margem de lucro em porcentagem
   * @param {number} lucroLiquido - Lucro líquido calculado
   * @param {number} valorRecebido - Valor recebido
   * @returns {number} Margem de lucro em porcentagem
   */
  calculateProfitMargin(lucroLiquido, valorRecebido) {
    if (valorRecebido === 0) {
      return 0;
    }

    const margem = (lucroLiquido / valorRecebido) * 100;
    return parseFloat(margem.toFixed(2));
  }

  /**
   * Valida os dados de entrada para cálculo
   * @param {ProfitCalculationDTO} dto - Dados para validar
   * @throws {Error} Se os dados forem inválidos
   */
  validateInput(dto) {
    const {
      valorRecebido,
      custoImpressao,
      taxaFixaPlataforma,
      porcentagemComissao,
      custoEnvio
    } = dto;

    if (typeof valorRecebido !== 'number' || valorRecebido < 0) {
      throw new Error('Valor recebido deve ser um número positivo');
    }

    if (typeof custoImpressao !== 'number' || custoImpressao < 0) {
      throw new Error('Custo de impressão deve ser um número positivo');
    }

    if (typeof taxaFixaPlataforma !== 'number' || taxaFixaPlataforma < 0) {
      throw new Error('Taxa fixa da plataforma deve ser um número positivo');
    }

    if (typeof porcentagemComissao !== 'number' || porcentagemComissao < 0) {
      throw new Error('Porcentagem de comissão deve ser um número positivo');
    }

    if (typeof custoEnvio !== 'number' || custoEnvio < 0) {
      throw new Error('Custo de envio deve ser um número positivo');
    }
  }

  /**
   * Calcula a comissão total da plataforma (taxa fixa + porcentagem)
   * @param {ProfitCalculationDTO} dto - Dados para cálculo
   * @returns {number} Comissão total da plataforma
   */
  calculatePlatformCommission(dto) {
    const {
      valorRecebido,
      taxaFixaPlataforma,
      porcentagemComissao
    } = dto;

    // Validação básica
    this.validateInput(dto);

    // Cálculo da comissão da plataforma (percentual sobre o valor recebido)
    const comissaoPercentual = (valorRecebido * porcentagemComissao) / 100;

    // Comissão total = taxa fixa + comissão percentual
    const comissaoTotal = taxaFixaPlataforma + comissaoPercentual;

    return parseFloat(comissaoTotal.toFixed(2));
  }

  /**
   * Calcula todos os dados relevantes de uma venda
   * @param {ProfitCalculationDTO} dto - Dados para cálculo
   * @returns {Object} Objeto com lucro líquido, margem e comissão total da plataforma
   */
  calculateAll(dto) {
    const lucroLiquido = this.calculateProfit(dto);
    const margemLucro = this.calculateProfitMargin(lucroLiquido, dto.valorRecebido);
    const comissaoPlataformaTotal = this.calculatePlatformCommission(dto);

    return {
      lucroLiquido,
      margemLucro,
      comissaoPlataformaTotal
    };
  }
}

module.exports = ProfitCalculationService;