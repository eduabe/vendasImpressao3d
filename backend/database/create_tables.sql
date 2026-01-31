-- =============================================
-- Script de Criação de Tabelas - Calculadora de Ganhos
-- Sistema de Gerenciamento de Vendas de Impressão 3D
-- =============================================

-- Limpar tabelas se existirem (em ordem de dependência)
DROP TABLE IF EXISTS vendas CASCADE;
DROP TABLE IF EXISTS plataformas CASCADE;

-- =============================================
-- Tabela: plataformas
-- =============================================
CREATE TABLE plataformas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    taxa_venda DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    porcentagem_comissao DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários da tabela
COMMENT ON TABLE plataformas IS 'Cadastro de plataformas de venda (Shopee, Mercado Livre, etc)';
COMMENT ON COLUMN plataformas.taxa_venda IS 'Taxa fixa cobrada pela plataforma';
COMMENT ON COLUMN plataformas.porcentagem_comissao IS 'Porcentagem de comissão cobrada pela plataforma';

-- Índices para otimização de consultas
CREATE INDEX idx_plataformas_nome ON plataformas(nome);
CREATE INDEX idx_plataformas_criacao ON plataformas(data_criacao);

-- =============================================
-- Tabela: vendas
-- =============================================
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    descricao TEXT,
    valor_recebido DECIMAL(10, 2) NOT NULL,
    custo_impressao DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_venda_plataforma DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_envio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    plataforma_id INTEGER NOT NULL,
    plataforma_nome VARCHAR(100) NOT NULL,
    origem_venda VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Em Produção',
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lucro_liquido DECIMAL(10, 2) NOT NULL,
    margem_lucro DECIMAL(5, 2) NOT NULL,
    comissao_plataforma_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Chave estrangeira para plataformas
    CONSTRAINT fk_vendas_plataforma 
        FOREIGN KEY (plataforma_id) 
        REFERENCES plataformas(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Comentários da tabela
COMMENT ON TABLE vendas IS 'Cadastro de vendas de impressão 3D';
COMMENT ON COLUMN vendas.descricao IS 'Descrição livre do item vendido';
COMMENT ON COLUMN vendas.valor_recebido IS 'Valor total recebido pela venda';
COMMENT ON COLUMN vendas.custo_impressao IS 'Custo do filamento e energia da impressão';
COMMENT ON COLUMN vendas.custo_venda_plataforma IS 'Taxa fixa cobrada pela plataforma';
COMMENT ON COLUMN vendas.custo_envio IS 'Custo de embalagem e envio';
COMMENT ON COLUMN vendas.origem_venda IS 'De onde veio a venda (Instagram, direto, etc)';
COMMENT ON COLUMN vendas.status IS 'Status da venda: Em Produção, Aguardando Envio, Enviada, Finalizada';
COMMENT ON COLUMN vendas.lucro_liquido IS 'Lucro calculado (Valor - Taxas - Custos)';
COMMENT ON COLUMN vendas.margem_lucro IS 'Margem de lucro em porcentagem';
COMMENT ON COLUMN vendas.comissao_plataforma_total IS 'Valor total da comissão da plataforma (taxa fixa + porcentagem sobre valor recebido)';

-- Índices para otimização de consultas e filtros
CREATE INDEX idx_vendas_status ON vendas(status);
CREATE INDEX idx_vendas_origem ON vendas(origem_venda);
CREATE INDEX idx_vendas_plataforma ON vendas(plataforma_id);
CREATE INDEX idx_vendas_data_cadastro ON vendas(data_cadastro);
CREATE INDEX idx_vendas_lucro ON vendas(lucro_liquido);

-- Índice composto para consultas de range de data
CREATE INDEX idx_vendas_data_cadastro_range ON vendas(data_cadastro DESC);

-- Índice para ordenação por data
CREATE INDEX idx_vendas_data_cadastro_order ON vendas(data_cadastro DESC);

-- =============================================
-- Trigger para atualizar data_atualização automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela plataformas
CREATE TRIGGER trigger_plataformas_atualizacao
    BEFORE UPDATE ON plataformas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- Aplicar trigger na tabela vendas
CREATE TRIGGER trigger_vendas_atualizacao
    BEFORE UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- =============================================
-- Função para cálculo de lucro (opcional - pode ser usada no futuro)
-- =============================================
CREATE OR REPLACE FUNCTION calcular_lucro_liquido(
    p_valor_recebido DECIMAL,
    p_taxa_fixa DECIMAL,
    p_porcentagem_comissao DECIMAL,
    p_custo_impressao DECIMAL,
    p_custo_envio DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    v_comissao DECIMAL;
    v_lucro DECIMAL;
BEGIN
    v_comissao = (p_valor_recebido * p_porcentagem_comissao) / 100;
    v_lucro = p_valor_recebido - v_comissao - p_taxa_fixa - p_custo_impressao - p_custo_envio;
    RETURN ROUND(v_lucro, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_lucro_liquido IS 'Função auxiliar para cálculo de lucro líquido';

-- =============================================
-- Inserir dados de exemplo (opcional)
-- =============================================
INSERT INTO plataformas (nome, taxa_venda, porcentagem_comissao) VALUES
('Shopee', 5.00, 12.00),
('Mercado Livre', 6.00, 15.00),
('Instagram', 0.00, 0.00),
('Direto', 0.00, 0.00);

-- Exemplo de venda
INSERT INTO vendas (
    valor_recebido, 
    custo_impressao, 
    custo_venda_plataforma, 
    custo_envio, 
    plataforma_id, 
    plataforma_nome, 
    origem_venda, 
    status,
    lucro_liquido,
    margem_lucro,
    comissao_plataforma_total
) VALUES (
    150.00, 
    30.00, 
    5.00, 
    15.00, 
    1, 
    'Shopee', 
    'Instagram', 
    'Em Produção',
    82.00,
    54.67,
    23.00
);

-- =============================================
-- Finalizado
-- =============================================
SELECT 'Tabelas criadas com sucesso!' AS mensagem;