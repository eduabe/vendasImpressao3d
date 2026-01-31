-- =============================================
-- Migration: Adicionar campo descricao na tabela vendas
-- =============================================

-- Adicionar coluna descricao na tabela vendas
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Adicionar comentário na coluna
COMMENT ON COLUMN vendas.descricao IS 'Descrição livre do item vendido';

-- =============================================
-- Finalizado
-- =============================================
SELECT 'Campo descricao adicionado com sucesso!' AS mensagem;