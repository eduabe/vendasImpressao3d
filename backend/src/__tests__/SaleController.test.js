const SaleController = require('../controllers/SaleController');

describe('SaleController', () => {
  let saleController;
  let mockSaleRepository;
  let mockPlatformRepository;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock dos repositórios
    mockSaleRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findByFilters: jest.fn()
    };

    mockPlatformRepository = {
      findById: jest.fn()
    };

    // Instanciar o controller com mocks
    saleController = new SaleController(mockSaleRepository, mockPlatformRepository);

    // Mock request e response
    mockReq = {
      params: {},
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update()', () => {
    const saleExistente = {
      id: 1,
      descricao: 'Venda teste',
      valorRecebido: 150,
      custoImpressao: 10,
      custoEnvio: 20,
      plataformaId: 1,
      plataformaNome: 'Plataforma 1',
      plataformaPorcentagem: 12,
      origemVenda: 'Instagram',
      status: 'EM_PRODUCAO',
      dataCadastro: '2024-01-01T00:00:00.000Z',
      lucroLiquido: 82,
      margemLucro: 54.67
    };

    const plataforma1 = {
      id: 1,
      nome: 'Plataforma 1',
      taxaVenda: 5,
      porcentagemComissao: 12
    };

    const plataforma2 = {
      id: 2,
      nome: 'Plataforma 2',
      taxaVenda: 6,
      porcentagemComissao: 15
    };

    beforeEach(() => {
      mockSaleRepository.findById.mockResolvedValue(saleExistente);
      mockPlatformRepository.findById.mockResolvedValue(plataforma2);
      mockSaleRepository.update.mockResolvedValue({ ...saleExistente });
    });

    describe('Teste 1.1: Atualização de plataforma com novos custos fornecidos', () => {
      test('deve persistir custoImpressao e custoEnvio quando plataforma muda e custos são fornecidos', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2,
          custoImpressao: 15,
          custoEnvio: 25
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.findById).toHaveBeenCalledWith('1');
        expect(mockPlatformRepository.findById).toHaveBeenCalledWith(2);
        
        // Verificar que update foi chamado com os novos valores de custo
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            custoImpressao: 15,
            custoEnvio: 25,
            plataformaId: 2,
            plataformaNome: 'Plataforma 2',
            plataformaPorcentagem: 15
          })
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            mensagem: 'Venda atualizada com sucesso'
          })
        );
      });
    });

    describe('Teste 1.2: Atualização de plataforma sem fornecer custos', () => {
      test('deve manter custos existentes quando plataforma muda sem fornecer custos', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            custoImpressao: 10, // Valor original
            custoEnvio: 20,      // Valor original
            plataformaId: 2
          })
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      test('deve recalcular lucro com custos originais', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            lucroLiquido: expect.any(Number),
            margemLucro: expect.any(Number)
          })
        );
      });
    });

    describe('Teste 1.3: Atualização sem mudar plataforma (lógica existente)', () => {
      beforeEach(() => {
        mockPlatformRepository.findById.mockResolvedValue(plataforma1);
      });

      test('deve atualizar custos sem mudar plataforma', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          custoImpressao: 15,
          custoEnvio: 25
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockPlatformRepository.findById).toHaveBeenCalledWith(1);
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            custoImpressao: 15,
            custoEnvio: 25,
            lucroLiquido: expect.any(Number),
            margemLucro: expect.any(Number)
          })
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      test('deve manter plataforma original quando não é alterada', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          custoImpressao: 15
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.not.objectContaining({
            plataformaId: expect.any(Number)
          })
        );
      });
    });

    describe('Teste 1.4: Atualização parcial - apenas custoImpressao', () => {
      test('deve atualizar apenas custoImpressao quando fornecido isoladamente com mudança de plataforma', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2,
          custoImpressao: 15
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            custoImpressao: 15,
            custoEnvio: 20, // Valor original mantido
            plataformaId: 2
          })
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('Teste 1.5: Atualização parcial - apenas custoEnvio', () => {
      test('deve atualizar apenas custoEnvio quando fornecido isoladamente com mudança de plataforma', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2,
          custoEnvio: 25
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            custoImpressao: 10, // Valor original mantido
            custoEnvio: 25,
            plataformaId: 2
          })
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('Cenários adicionais', () => {
      test('deve atualizar valorRecebido junto com custos quando plataforma muda', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2,
          valorRecebido: 200,
          custoImpressao: 15,
          custoEnvio: 25
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            valorRecebido: 200,
            custoImpressao: 15,
            custoEnvio: 25,
            plataformaId: 2
          })
        );
      });

      test('deve retornar 404 quando venda não existe', async () => {
        // Arrange
        mockSaleRepository.findById.mockResolvedValue(null);
        mockReq.params = { id: '999' };
        mockReq.body = { plataformaId: 2 };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          mensagem: 'Venda não encontrada'
        });
      });

      test('deve retornar 404 quando nova plataforma não existe', async () => {
        // Arrange
        mockPlatformRepository.findById.mockResolvedValue(null);
        mockReq.params = { id: '1' };
        mockReq.body = { plataformaId: 999 };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          mensagem: 'Plataforma não encontrada'
        });
      });

      test('deve atualizar outros campos (descricao, origemVenda, status)', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          descricao: 'Nova descrição',
          origemVenda: 'Facebook',
          status: 'CONCLUIDA'
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            descricao: 'Nova descrição',
            origemVenda: 'Facebook',
            status: 'CONCLUIDA'
          })
        );
      });

      test('deve atualizar custos e plataforma em uma única operação', async () => {
        // Arrange
        mockReq.params = { id: '1' };
        mockReq.body = {
          plataformaId: 2,
          custoImpressao: 18,
          custoEnvio: 22,
          descricao: 'Atualização completa'
        };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockSaleRepository.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            plataformaId: 2,
            plataformaNome: 'Plataforma 2',
            plataformaPorcentagem: 15,
            custoImpressao: 18,
            custoEnvio: 22,
            descricao: 'Atualização completa'
          })
        );
      });

      test('deve tratar erro no repositório', async () => {
        // Arrange
        mockSaleRepository.update.mockRejectedValue(new Error('Erro de banco de dados'));
        mockReq.params = { id: '1' };
        mockReq.body = { custoImpressao: 15 };

        // Act
        await saleController.update(mockReq, mockRes);

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          mensagem: 'Erro ao atualizar venda',
          erro: 'Erro de banco de dados'
        });
      });
    });
  });

  describe('create()', () => {
    test('deve criar uma venda com sucesso', async () => {
      // Arrange
      mockPlatformRepository.findById.mockResolvedValue({
        id: 1,
        nome: 'Plataforma Teste',
        taxaVenda: 5,
        porcentagemComissao: 12
      });
      mockSaleRepository.create.mockResolvedValue({ id: 1 });

      mockReq.body = {
        descricao: 'Venda teste',
        valorRecebido: 150,
        custoImpressao: 30,
        custoEnvio: 15,
        plataformaId: 1,
        origemVenda: 'Instagram'
      };

      // Act
      await saleController.create(mockReq, mockRes);

      // Assert
      expect(mockSaleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: 'Venda teste',
          valorRecebido: 150,
          custoImpressao: 30,
          custoEnvio: 15,
          plataformaId: 1,
          lucroLiquido: expect.any(Number)
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('deve validar valorRecebido obrigatório', async () => {
      // Arrange
      mockReq.body = {
        plataformaId: 1,
        origemVenda: 'Instagram'
      };

      // Act
      await saleController.create(mockReq, mockRes);

      // Assert
      expect(mockSaleRepository.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensagem: 'Valor recebido é obrigatório e deve ser positivo'
      });
    });

    test('deve validar origemVenda obrigatória', async () => {
      // Arrange
      mockReq.body = {
        valorRecebido: 150,
        plataformaId: 1
      };

      // Act
      await saleController.create(mockReq, mockRes);

      // Assert
      expect(mockSaleRepository.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensagem: 'Origem da venda é obrigatória'
      });
    });
  });

  describe('findById()', () => {
    test('deve retornar venda quando existe', async () => {
      // Arrange
      const venda = { id: 1, descricao: 'Venda teste' };
      mockSaleRepository.findById.mockResolvedValue(venda);
      mockReq.params = { id: '1' };

      // Act
      await saleController.findById(mockReq, mockRes);

      // Assert
      expect(mockSaleRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({ dados: venda });
    });

    test('deve retornar 404 quando venda não existe', async () => {
      // Arrange
      mockSaleRepository.findById.mockResolvedValue(null);
      mockReq.params = { id: '999' };

      // Act
      await saleController.findById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensagem: 'Venda não encontrada'
      });
    });
  });

  describe('delete()', () => {
    test('deve deletar venda com sucesso', async () => {
      // Arrange
      mockSaleRepository.delete.mockResolvedValue(true);
      mockReq.params = { id: '1' };

      // Act
      await saleController.delete(mockReq, mockRes);

      // Assert
      expect(mockSaleRepository.delete).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        mensagem: 'Venda removida com sucesso'
      });
    });

    test('deve retornar 404 quando venda não existe', async () => {
      // Arrange
      mockSaleRepository.delete.mockResolvedValue(false);
      mockReq.params = { id: '999' };

      // Act
      await saleController.delete(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensagem: 'Venda não encontrada'
      });
    });
  });
});