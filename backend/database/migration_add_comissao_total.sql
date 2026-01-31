-- =============================================
-- Migration: Adicionar coluna de comissão total da plataforma
-- Versão: 2.0
-- Data: 2026-01-31
-- =============================================

-- Adicionar coluna para armazenar a comissão total da plataforma
-- Isso inclui a taxa fixa + porcentagem calculada
ALTER TABLE vendas 
ADD COLUMN IF NOT EXISTS comissao_plataforma_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Adicionar comentário à coluna
COMMENT ON COLUMN vendas.comissao_plataforma_total IS 'Valor total da comissão da plataforma (taxa fixa + porcentagem sobre valor recebido)';

-- Atualizar registros existentes com o cálculo correto
-- A comissão total = custo_venda_plataforma (taxa fixa) + (valor_recebido * porcentagem_comissao / 100)
UPDATE vendas v
SET comissao_plataforma_total = 
    v.custo_venda_plataforma + 
    ROUND((v.valor_recebido * (SELECT porcentagem_comissao FROM plataformas p WHERE p.id = v.plataforma_id) / 100), 2)
WHERE v.comissao_plataforma_total = 0.00;

-- Criar índice para otimização (opcional)
CREATE INDEX IF NOT EXISTS idx_vendas_comissao_plataforma ON vendas(comissao_plataforma_total);

SELECT 'Migration executada com sucesso! Coluna comissao_plataforma_total adicionada.' AS mensagem;