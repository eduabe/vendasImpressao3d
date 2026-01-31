/**
 * Controller de Plataformas
 */
class PlatformController {
  constructor(platformRepository) {
    this.platformRepository = platformRepository;
  }

  /**
   * Cria uma nova plataforma
   */
  async create(req, res) {
    try {
      const { nome, taxaVenda, porcentagemComissao } = req.body;

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({ 
          mensagem: 'Nome da plataforma é obrigatório' 
        });
      }

      const platform = {
        nome: nome.trim(),
        taxaVenda: parseFloat(taxaVenda) || 0,
        porcentagemComissao: parseFloat(porcentagemComissao) || 0
      };

      const created = this.platformRepository.create(platform);
      
      res.status(201).json({
        mensagem: 'Plataforma criada com sucesso',
        dados: created
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao criar plataforma',
        erro: error.message 
      });
    }
  }

  /**
   * Lista todas as plataformas
   */
  async listAll(req, res) {
    try {
      const platforms = this.platformRepository.findAll();
      res.json({
        dados: platforms
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao buscar plataformas',
        erro: error.message 
      });
    }
  }

  /**
   * Busca uma plataforma por ID
   */
  async findById(req, res) {
    try {
      const { id } = req.params;
      const platform = this.platformRepository.findById(id);

      if (!platform) {
        return res.status(404).json({ 
          mensagem: 'Plataforma não encontrada' 
        });
      }

      res.json({ dados: platform });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao buscar plataforma',
        erro: error.message 
      });
    }
  }

  /**
   * Atualiza uma plataforma
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, taxaVenda, porcentagemComissao } = req.body;

      const updateData = {};
      if (nome !== undefined) updateData.nome = nome.trim();
      if (taxaVenda !== undefined) updateData.taxaVenda = parseFloat(taxaVenda);
      if (porcentagemComissao !== undefined) {
        updateData.porcentagemComissao = parseFloat(porcentagemComissao);
      }

      const updated = this.platformRepository.update(id, updateData);

      if (!updated) {
        return res.status(404).json({ 
          mensagem: 'Plataforma não encontrada' 
        });
      }

      res.json({
        mensagem: 'Plataforma atualizada com sucesso',
        dados: updated
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao atualizar plataforma',
        erro: error.message 
      });
    }
  }

  /**
   * Remove uma plataforma
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = this.platformRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ 
          mensagem: 'Plataforma não encontrada' 
        });
      }

      res.json({ 
        mensagem: 'Plataforma removida com sucesso' 
      });
    } catch (error) {
      res.status(500).json({ 
        mensagem: 'Erro ao remover plataforma',
        erro: error.message 
      });
    }
  }
}

module.exports = PlatformController;