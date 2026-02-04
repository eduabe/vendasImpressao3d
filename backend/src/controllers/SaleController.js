const SaleStatus = require('../domain/models/SaleStatus');
const ProfitCalculationService = require('../domain/services/ProfitCalculationService');

/**
 * Controller de Vendas
 */
class SaleController {
  constructor(saleRepository, platformRepository) {
    this.saleRepository = saleRepository;
    this.platformRepository = platformRepository;
    this.profitService = new ProfitCalculationService();
  }

  /**
   * Cria uma nova venda
   */
  async create(req, res) {
    try {
      const {
        descricao,
        valorRecebido,
        custoImpressao,
        custoEnvio,
        plataformaId,
        origemVenda
      } = req.body;

      // Validações básicas
      if (!valorRecebido || valorRecebido < 0) {
        return res.status(400).json({ 
          mensagem: 'Valor recebido é obrigatório e deve ser positivo' 
        });
      }

      if (!origemVenda || origemVenda.trim().length === 0) {
        return res.status(400).json({ 
          mensagem: 'Origem da venda é obrigatória' 
        });
      }

      if (!plataformaId) {
        return res.status(400).json({ 
          mensagem: 'Plataforma de venda é obrigatória' 
        });
      }

      // Buscar plataforma para obter taxas
      const platform = await this.platformRepository.findById(plataformaId);
      if (!platform) {
        return res.status(404).json({ 
          mensagem: 'Plataforma não encontrada' 
        });
      }

      // Calcular lucro líquido
      const calculationResult = this.profitService.calculateAll({
        valorRecebido: parseFloat(valorRecebido),
        custoImpressao: parseFloat(custoImpressao) || 0,
        taxaFixaPlataforma: platform.taxaVenda,
        porcentagemComissao: platform.porcentagemComissao,
        custoEnvio: parseFloat(custoEnvio) || 0
      });

      // Criar venda
      const sale = {
        descricao: descricao ? descricao.trim() : '',
        valorRecebido: parseFloat(valorRecebido),
        custoImpressao: parseFloat(custoImpressao) || 0,
        custoVendaPlataforma: calculationResult.comissaoPlataformaTotal,
        custoEnvio: parseFloat(custoEnvio) || 0,
        plataformaId,
        plataformaNome: platform.nome,
        plataformaPorcentagem: platform.porcentagemComissao,
        origemVenda: origemVenda.trim(),
        status: SaleStatus.EM_PRODUCAO,
        dataCadastro: new Date().toISOString(),
        lucroLiquido: calculationResult.lucroLiquido,
        margemLucro: calculationResult.margemLucro,
        comissaoPlataformaTotal: calculationResult.comissaoPlataformaTotal
      };

      const created = await this.saleRepository.create(sale);
      
      res.status(201).json({
        mensagem: 'Venda criada com sucesso',
        dados: created
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao criar venda',
        erro: error.message 
      });
    }
  }

  /**
   * Lista todas as vendas com filtros
   */
  async listAll(req, res) {
    try {
      const {
        status,
        origemVenda,
        plataformaId,
        dataInicio,
        dataFim,
        ordenarPor,
        ordem
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (origemVenda) filters.origemVenda = origemVenda;
      if (plataformaId) filters.plataformaId = plataformaId;
      if (dataInicio) filters.dataInicio = dataInicio;
      if (dataFim) filters.dataFim = dataFim;
      if (ordenarPor) filters.ordenarPor = ordenarPor;
      if (ordem) filters.ordem = ordem;

      const sales = await this.saleRepository.findByFilters(filters);
      
      res.json({
        dados: sales,
        total: sales.length
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao buscar vendas',
        erro: error.message 
      });
    }
  }

  /**
   * Busca uma venda por ID
   */
  async findById(req, res) {
    try {
      const { id } = req.params;
      const sale = await this.saleRepository.findById(id);

      if (!sale) {
        return res.status(404).json({ 
          mensagem: 'Venda não encontrada' 
        });
      }

      res.json({ dados: sale });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao buscar venda',
        erro: error.message 
      });
    }
  }

  /**
   * Atualiza uma venda
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        descricao,
        valorRecebido,
        custoImpressao,
        custoEnvio,
        plataformaId,
        origemVenda,
        status
      } = req.body;

      const sale = await this.saleRepository.findById(id);
      if (!sale) {
        return res.status(404).json({ 
          mensagem: 'Venda não encontrada' 
        });
      }

      const updateData = {};
      
      // Determinar valores a usar (novo valor ou valor atual)
      const valor = valorRecebido !== undefined ? parseFloat(valorRecebido) : sale.valorRecebido;
      const custoImp = custoImpressao !== undefined ? parseFloat(custoImpressao) : sale.custoImpressao;
      const custoEnv = custoEnvio !== undefined ? parseFloat(custoEnvio) : sale.custoEnvio;
      let plataforma = null;
      let precisaRecalcular = false;
      
      // Verificar se precisa recalcular lucro
      if (plataformaId && plataformaId !== sale.plataformaId) {
        // Se mudou a plataforma
        plataforma = await this.platformRepository.findById(plataformaId);
        if (!plataforma) {
          return res.status(404).json({ 
            mensagem: 'Plataforma não encontrada' 
          });
        }
        
        updateData.plataformaId = plataformaId;
        updateData.plataformaNome = plataforma.nome;
        updateData.plataformaPorcentagem = plataforma.porcentagemComissao;
        precisaRecalcular = true;
      } else if (valorRecebido !== undefined || custoImpressao !== undefined || custoEnvio !== undefined) {
        // Se mudou valores mas não plataforma, recalcular também
        plataforma = await this.platformRepository.findById(sale.plataformaId);
        precisaRecalcular = true;
      }
      
      // Se precisa recalcular, faz o cálculo
      if (precisaRecalcular) {
        const calculationResult = this.profitService.calculateAll({
          valorRecebido: valor,
          custoImpressao: custoImp,
          taxaFixaPlataforma: plataforma.taxaVenda,
          porcentagemComissao: plataforma.porcentagemComissao,
          custoEnvio: custoEnv
        });
        
        updateData.custoVendaPlataforma = calculationResult.comissaoPlataformaTotal;
        updateData.lucroLiquido = calculationResult.lucroLiquido;
        updateData.margemLucro = calculationResult.margemLucro;
        updateData.comissaoPlataformaTotal = calculationResult.comissaoPlataformaTotal;
      }
      
      // Atualizar campos numéricos se foram enviados
      if (valorRecebido !== undefined) updateData.valorRecebido = valor;
      if (custoImpressao !== undefined) updateData.custoImpressao = custoImp;
      if (custoEnvio !== undefined) updateData.custoEnvio = custoEnv;

      // Atualizar campos de texto
      if (origemVenda !== undefined) updateData.origemVenda = origemVenda.trim();
      if (descricao !== undefined) updateData.descricao = descricao ? descricao.trim() : '';
      if (status !== undefined) updateData.status = status;

      const updated = await this.saleRepository.update(id, updateData);

      res.json({
        mensagem: 'Venda atualizada com sucesso',
        dados: updated
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao atualizar venda',
        erro: error.message 
      });
    }
  }

  /**
   * Remove uma venda
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.saleRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ 
          mensagem: 'Venda não encontrada' 
        });
      }

      res.json({ 
        mensagem: 'Venda removida com sucesso' 
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao remover venda',
        erro: error.message 
      });
    }
  }
}

module.exports = SaleController;