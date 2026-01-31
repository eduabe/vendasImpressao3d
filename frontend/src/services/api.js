import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Sales API - backend route is /api/vendas (Portuguese)
export const getSales = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.status) params.append('status', filtros.status);
  if (filtros.origemVenda) params.append('origemVenda', filtros.origemVenda);
  if (filtros.plataformaId) params.append('plataformaId', filtros.plataformaId);
  if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
  if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
  if (filtros.ordenarPor) params.append('ordenarPor', filtros.ordenarPor);
  if (filtros.ordem) params.append('ordem', filtros.ordem);

  const response = await axios.get(`${API_URL}/vendas?${params.toString()}`);
  // Backend returns { dados: [...], total: N }, extract dados array
  return response.data.dados || [];
};

export const createSale = async (saleData) => {
  const response = await axios.post(`${API_URL}/vendas`, saleData);
  return response.data.dados || response.data;
};

export const updateSale = async (id, saleData) => {
  const response = await axios.put(`${API_URL}/vendas/${id}`, saleData);
  return response.data.dados || response.data;
};

export const deleteSale = async (id) => {
  const response = await axios.delete(`${API_URL}/vendas/${id}`);
  return response.data;
};

// Sales service with Portuguese method names
export const vendaService = {
  listar: getSales,
  criar: createSale,
  atualizar: updateSale,
  deletar: deleteSale
};

// Platforms API - backend route is /api/plataformas
export const getPlatforms = async () => {
  const response = await axios.get(`${API_URL}/plataformas`);
  // Backend returns { dados: [...], total: N }, extract dados array
  return response.data.dados || [];
};

export const createPlatform = async (platformData) => {
  const response = await axios.post(`${API_URL}/plataformas`, platformData);
  return response.data.dados || response.data;
};

export const updatePlatform = async (id, platformData) => {
  const response = await axios.put(`${API_URL}/plataformas/${id}`, platformData);
  return response.data.dados || response.data;
};

export const deletePlatform = async (id) => {
  const response = await axios.delete(`${API_URL}/plataformas/${id}`);
  return response.data;
};

// Platforms service with Portuguese method names
export const plataformaService = {
  listar: getPlatforms,
  criar: createPlatform,
  atualizar: updatePlatform,
  deletar: deletePlatform
};
