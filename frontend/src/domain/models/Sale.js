/**
 * Modelo de Venda para o Frontend
 * Deve refletir a estrutura do backend
 */
const Sale = {
  id: null,
  descricao: '',
  valorRecebido: 0,
  custoImpressao: 0,
  custoVendaPlataforma: 0,
  custoEnvio: 0,
  plataformaId: null,
  plataformaNome: '',
  plataformaPorcentagem: 0,
  origemVenda: '',
  status: '',
  dataCadastro: null,
  lucroLiquido: 0,
  margemLucro: 0,
  comissaoPlataformaTotal: 0
};

export default Sale;
