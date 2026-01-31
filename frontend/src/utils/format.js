import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata valor monetário para BRL
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata porcentagem
 */
export const formatPercent = (value) => {
  return `${value.toFixed(2)}%`;
};

/**
 * Formata data para exibição
 */
export const formatDate = (dateString) => {
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

/**
 * Formata data apenas (sem hora)
 */
export const formatDateOnly = (dateString) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
};

/**
 * Retorna cor baseada no status
 */
export const getStatusColor = (status) => {
  const colors = {
    'Em Produção': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Aguardando Envio': 'bg-blue-100 text-blue-800 border-blue-200',
    'Enviada': 'bg-purple-100 text-purple-800 border-purple-200',
    'Finalizada': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Retorna ícone baseado no status
 */
export const getStatusIcon = (status) => {
  const icons = {
    'Em Produção': '⚙️',
    'Aguardando Envio': '📦',
    'Enviada': '🚚',
    'Finalizada': '✅'
  };
  return icons[status] || '📋';
};