const ProfitCalculationService = require('../domain/services/ProfitCalculationService');

describe('ProfitCalculationService', () => {
  let profitService;

  beforeEach(() => {
    profitService = new ProfitCalculationService();
  });

  describe('calculateProfit', () => {
    test('deve calcular lucro corretamente com valores positivos', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      const lucro = profitService.calculateProfit(dto);
      
      // Cálculo: 150 - (150 * 0.12) - 5 - 30 - 15 = 150 - 18 - 5 - 30 - 15 = 82
      expect(lucro).toBe(82);
    });

    test('deve calcular lucro com plataforma sem taxas', () => {
      const dto = {
        valorRecebido: 200,
        custoImpressao: 40,
        taxaFixaPlataforma: 0,
        porcentagemComissao: 0,
        custoEnvio: 20
      };

      const lucro = profitService.calculateProfit(dto);
      
      // Cálculo: 200 - 0 - 0 - 40 - 20 = 140
      expect(lucro).toBe(140);
    });

    test('deve calcular lucro negativo quando custos superam valor recebido', () => {
      const dto = {
        valorRecebido: 50,
        custoImpressao: 30,
        taxaFixaPlataforma: 10,
        porcentagemComissao: 20,
        custoEnvio: 20
      };

      const lucro = profitService.calculateProfit(dto);
      
      // Cálculo: 50 - 10 - 10 - 30 - 20 = -20
      expect(lucro).toBe(-20);
    });

    test('deve calcular lucro zero quando todos os custos iguais ao valor', () => {
      const dto = {
        valorRecebido: 100,
        custoImpressao: 50,
        taxaFixaPlataforma: 10,
        porcentagemComissao: 30,
        custoEnvio: 10
      };

      const lucro = profitService.calculateProfit(dto);
      
      // Cálculo: 100 - 30 - 10 - 50 - 10 = 0
      expect(lucro).toBe(0);
    });

    test('deve lançar erro quando valorRecebido é negativo', () => {
      const dto = {
        valorRecebido: -100,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      expect(() => profitService.calculateProfit(dto)).toThrow(
        'Valor recebido deve ser um número positivo'
      );
    });

    test('deve lançar erro quando custoImpressao é negativo', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: -30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      expect(() => profitService.calculateProfit(dto)).toThrow(
        'Custo de impressão deve ser um número positivo'
      );
    });

    test('deve lançar erro quando taxaFixaPlataforma é negativa', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: 30,
        taxaFixaPlataforma: -5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      expect(() => profitService.calculateProfit(dto)).toThrow(
        'Taxa fixa da plataforma deve ser um número positivo'
      );
    });

    test('deve lançar erro quando porcentagemComissao é negativa', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: -12,
        custoEnvio: 15
      };

      expect(() => profitService.calculateProfit(dto)).toThrow(
        'Porcentagem de comissão deve ser um número positivo'
      );
    });

    test('deve lançar erro quando custoEnvio é negativo', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: -15
      };

      expect(() => profitService.calculateProfit(dto)).toThrow(
        'Custo de envio deve ser um número positivo'
      );
    });

    test('deve arredondar resultado para 2 casas decimais', () => {
      const dto = {
        valorRecebido: 100,
        custoImpressao: 33.333,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 10,
        custoEnvio: 15
      };

      const lucro = profitService.calculateProfit(dto);
      
      // Cálculo: 100 - 10 - 5 - 33.333 - 15 = 36.667
      expect(lucro).toBe(36.67);
    });

    test('deve aceitar zero como valor válido', () => {
      const dto = {
        valorRecebido: 0,
        custoImpressao: 0,
        taxaFixaPlataforma: 0,
        porcentagemComissao: 0,
        custoEnvio: 0
      };

      const lucro = profitService.calculateProfit(dto);
      expect(lucro).toBe(0);
    });
  });

  describe('calculateProfitMargin', () => {
    test('deve calcular margem de lucro corretamente', () => {
      const margem = profitService.calculateProfitMargin(82, 150);
      expect(margem).toBe(54.67);
    });

    test('deve retornar 0 quando valor recebido é 0', () => {
      const margem = profitService.calculateProfitMargin(100, 0);
      expect(margem).toBe(0);
    });

    test('deve calcular margem negativa quando há prejuízo', () => {
      const margem = profitService.calculateProfitMargin(-20, 100);
      expect(margem).toBe(-20);
    });

    test('deve calcular margem de 100%', () => {
      const margem = profitService.calculateProfitMargin(100, 100);
      expect(margem).toBe(100);
    });

    test('deve arredondar margem para 2 casas decimais', () => {
      const margem = profitService.calculateProfitMargin(50.6667, 100);
      expect(margem).toBe(50.67);
    });
  });

  describe('calculateAll', () => {
    test('deve calcular lucro e margem juntos', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      const resultado = profitService.calculateAll(dto);
      
      expect(resultado).toHaveProperty('lucroLiquido');
      expect(resultado).toHaveProperty('margemLucro');
      expect(resultado.lucroLiquido).toBe(82);
      expect(resultado.margemLucro).toBe(54.67);
    });

    test('deve validar dados antes de calcular', () => {
      const dto = {
        valorRecebido: -100,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      expect(() => profitService.calculateAll(dto)).toThrow(
        'Valor recebido deve ser um número positivo'
      );
    });
  });

  describe('cenários reais de mercado', () => {
    test('Shopee com comissão de 12% + taxa fixa de R$5', () => {
      const dto = {
        valorRecebido: 150,
        custoImpressao: 30,
        taxaFixaPlataforma: 5,
        porcentagemComissao: 12,
        custoEnvio: 15
      };

      const resultado = profitService.calculateAll(dto);
      
      expect(resultado.lucroLiquido).toBe(82);
      expect(resultado.margemLucro).toBe(54.67);
    });

    test('Mercado Livre com comissão de 15% + taxa fixa de R$6', () => {
      const dto = {
        valorRecebido: 200,
        custoImpressao: 40,
        taxaFixaPlataforma: 6,
        porcentagemComissao: 15,
        custoEnvio: 20
      };

      const resultado = profitService.calculateAll(dto);
      
      // Cálculo: 200 - 30 - 6 - 40 - 20 = 104
      expect(resultado.lucroLiquido).toBe(104);
      expect(resultado.margemLucro).toBe(52);
    });

    test('Venda direta sem taxas de plataforma', () => {
      const dto = {
        valorRecebido: 100,
        custoImpressao: 25,
        taxaFixaPlataforma: 0,
        porcentagemComissao: 0,
        custoEnvio: 10
      };

      const resultado = profitService.calculateAll(dto);
      
      expect(resultado.lucroLiquido).toBe(65);
      expect(resultado.margemLucro).toBe(65);
    });

    test('Venda de baixo valor com margem negativa', () => {
      const dto = {
        valorRecebido: 30,
        custoImpressao: 15,
        taxaFixaPlataforma: 2,
        porcentagemComissao: 15,
        custoEnvio: 10
      };

      const resultado = profitService.calculateAll(dto);
      
      // Cálculo: 30 - 4.5 - 2 - 15 - 10 = -1.5
      expect(resultado.lucroLiquido).toBe(-1.5);
      expect(resultado.margemLucro).toBe(-5);
    });
  });
});