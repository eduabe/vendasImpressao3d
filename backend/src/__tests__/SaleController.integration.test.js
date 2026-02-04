require('dotenv').config();
const { Pool } = require('pg');
const SaleController = require('../controllers/SaleController');
const SaleRepository = require('../repositories/SaleRepository');
const PlatformRepository = require('../repositories/PlatformRepository');
const ProfitCalculationService = require('../domain/services/ProfitCalculationService');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let saleController;
let saleRepository;
let platformRepository;
let profitCalculationService;

beforeAll(async () => {
  // Conectar ao banco
  await pool.connect();

  // Inicializar repositories e serviços
  saleRepository = new SaleRepository(pool);
  platformRepository = new PlatformRepository(pool);
  profitCalculationService = new ProfitCalculationService();

  // Inicializar controller
  saleController = new SaleController(
    saleRepository,
    platformRepository,
    profitCalculationService,
  );
}, 10000);

afterAll(async () => {
  // Fechar conexão com o banco
  await pool.end();
}, 10000);

beforeEach(async () => {
  // Limpar dados de teste antes de cada teste
  await pool.query("DELETE FROM vendas WHERE descricao LIKE $1", ["TESTE_%"]);
});

afterEach(async () => {
  // Limpar dados de teste após cada teste
  await pool.query("DELETE FROM vendas WHERE descricao LIKE $1", ["TESTE_%"]);
});

// Helper function to create a sale via controller
async function createTestSale(saleData) {
  const req = {
    body: saleData,
  };

  let responseData;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
      responseData = data;
      return data;
    }),
  };

  await saleController.create(req, res);
  return responseData.dados;
}

describe("PUT /api/vendas/:id - Atualização com mudança de plataforma", () => {
  it("deve persistir custoImpressao e custoEnvio quando plataforma é alterada", async () => {
    // SETUP: Verificar se há pelo menos 2 plataformas
    const plataformas = await pool.query("SELECT id FROM plataformas LIMIT 2");
    expect(plataformas.rows.length).toBeGreaterThanOrEqual(2);
    
    const plataforma1Id = plataformas.rows[0].id;
    const plataforma2Id = plataformas.rows[1].id;
    
    // SETUP: Criar venda de teste usando o controller
    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Original",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataforma1Id,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Atualizar venda mudando plataforma e custos
    const dadosAtualizacao = {
      descricao: "TESTE_Venda Atualizada",
      valorRecebido: 100.0,
      custoImpressao: 15.0,
      custoEnvio: 25.0,
      plataformaId: plataforma2Id,
      origemVenda: "manual",
      status: "concluida",
    };

    const req = {
      params: { id: vendaOriginal.id },
      body: dadosAtualizacao,
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar persistência no banco
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada).not.toBeNull();
    expect(vendaAtualizada.descricao).toBe("TESTE_Venda Atualizada");
    expect(vendaAtualizada.custoImpressao).toBe(15.0);
    expect(vendaAtualizada.custoEnvio).toBe(25.0);
    expect(vendaAtualizada.plataformaId).toBe(plataforma2Id);
    expect(vendaAtualizada.lucroLiquido).toBeGreaterThan(0);
    expect(vendaAtualizada.margemLucro).toBeGreaterThan(0);
  });
});

describe("PUT /api/vendas/:id - Atualização parcial", () => {
  it("deve atualizar apenas custoImpressao quando fornecido isoladamente", async () => {
    // SETUP: Obter uma plataforma para teste
    const plataforma = await pool.query("SELECT id FROM plataformas LIMIT 1");
    expect(plataforma.rows.length).toBeGreaterThan(0);
    
    const plataformaId = plataforma.rows[0].id;

    // SETUP: Criar venda de teste usando o controller
    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Parcial",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataformaId,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Atualizar apenas custoImpressao
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 15.0,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que apenas custoImpressao mudou
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.custoImpressao).toBe(15.0);
    expect(vendaAtualizada.custoEnvio).toBe(20.0); // Permanece inalterado
    expect(vendaAtualizada.plataformaId).toBe(plataformaId); // Permanece inalterado
  });
  
  it("deve atualizar apenas custoEnvio quando fornecido isoladamente", async () => {
    // SETUP: Obter uma plataforma para teste
    const plataforma = await pool.query("SELECT id FROM plataformas LIMIT 1");
    expect(plataforma.rows.length).toBeGreaterThan(0);
    
    const plataformaId = plataforma.rows[0].id;

    // SETUP: Criar venda de teste usando o controller
    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Parcial 2",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataformaId,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Atualizar apenas custoEnvio
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoEnvio: 25.0,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que apenas custoEnvio mudou
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.custoImpressao).toBe(10.0); // Permanece inalterado
    expect(vendaAtualizada.custoEnvio).toBe(25.0);
    expect(vendaAtualizada.plataformaId).toBe(plataformaId); // Permanece inalterado
  });
  
  it("deve atualizar ambos os custos quando fornecidos juntos", async () => {
    // SETUP: Obter uma plataforma para teste
    const plataforma = await pool.query("SELECT id FROM plataformas LIMIT 1");
    expect(plataforma.rows.length).toBeGreaterThan(0);
    
    const plataformaId = plataforma.rows[0].id;

    // SETUP: Criar venda de teste usando o controller
    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Parcial 3",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataformaId,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Atualizar ambos os custos
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 15.0,
        custoEnvio: 25.0,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que ambos os custos mudaram
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.custoImpressao).toBe(15.0);
    expect(vendaAtualizada.custoEnvio).toBe(25.0);
    expect(vendaAtualizada.plataformaId).toBe(plataformaId); // Permanece inalterado
  });
});

describe("PUT /api/vendas/:id - Cálculos financeiros", () => {
  it("deve recalcular lucroLiquido e margemLucro corretamente após atualização de custos", async () => {
    // SETUP: Obter uma plataforma para teste
    const plataforma = await pool.query("SELECT id, taxa_venda, porcentagem_comissao FROM plataformas LIMIT 1");
    expect(plataforma.rows.length).toBeGreaterThan(0);
    
    const plataformaId = plataforma.rows[0].id;
    const taxaVenda = plataforma.rows[0].taxa_venda;
    const porcentagemComissao = plataforma.rows[0].porcentagem_comissao;

    // SETUP: Criar venda com custos conhecidos usando o controller
    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Calculos",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataformaId,
      origemVenda: "manual",
      status: "concluida",
    });

    // Registrar valores originais
    const lucroOriginal = vendaOriginal.lucroLiquido;
    const margemOriginal = vendaOriginal.margemLucro;

    // WHEN: Aumentar custos
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 15.0, // Aumento de 5.0
        custoEnvio: 25.0, // Aumento de 5.0
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que lucro diminuiu e margem foi recalculada
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.lucroLiquido).toBeLessThan(lucroOriginal);
    expect(vendaAtualizada.margemLucro).toBeLessThan(margemOriginal);

    // Cálculo esperado: 100 - 15 - 25 - custo_plataforma = novo_lucro
    const novoCustoTotal = 15.0 + 25.0;
    const comissaoCalculada = taxaVenda + (100.0 * (porcentagemComissao / 100));
    const lucroEsperado = 100.0 - novoCustoTotal - comissaoCalculada;
    
    expect(vendaAtualizada.lucroLiquido).toBeCloseTo(lucroEsperado, 2);
  });
  
  it("deve aumentar lucroLiquido e margemLucro quando custos diminuem", async () => {
    // SETUP: Obter uma plataforma para teste
    const plataforma = await pool.query("SELECT id FROM plataformas LIMIT 1");
    expect(plataforma.rows.length).toBeGreaterThan(0);
    
    const plataformaId = plataforma.rows[0].id;

    // SETUP: Criar venda com custos altos usando o controller
    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Calculos 2",
      valorRecebido: 100.0,
      custoImpressao: 20.0,
      custoEnvio: 30.0,
      plataformaId: plataformaId,
      origemVenda: "manual",
      status: "concluida",
    });

    // Registrar valores originais
    const lucroOriginal = vendaOriginal.lucroLiquido;
    const margemOriginal = vendaOriginal.margemLucro;

    // WHEN: Diminuir custos
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 10.0, // Diminuição de 10.0
        custoEnvio: 20.0, // Diminuição de 10.0
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que lucro aumentou e margem foi recalculada
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.lucroLiquido).toBeGreaterThan(lucroOriginal);
    expect(vendaAtualizada.margemLucro).toBeGreaterThan(margemOriginal);
  });
});

describe("PUT /api/vendas/:id - Cenários de erro", () => {
  it("deve retornar 404 quando venda não é encontrada", async () => {
    const req = {
      params: { id: 999999 }, // ID inexistente
      body: {
        custoImpressao: 15.0,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensagem: expect.stringContaining("não encontrada"),
      }),
    );
  });
  
  it("deve retornar 404 quando plataforma informada não existe", async () => {
    // SETUP: Criar uma venda usando o controller
    const plataforma = await pool.query("SELECT id FROM plataformas LIMIT 1");
    expect(plataforma.rows.length).toBeGreaterThan(0);
    
    const plataformaId = plataforma.rows[0].id;

    const vendaOriginal = await createTestSale({
      descricao: "TESTE_Venda Erro Plataforma",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataformaId,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Tentar atualizar com plataforma inexistente
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 15.0,
        plataformaId: 999999, // ID de plataforma inexistente
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensagem: expect.stringContaining("Plataforma"),
      }),
    );
  });
});