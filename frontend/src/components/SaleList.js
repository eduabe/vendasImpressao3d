import React, { useState, useEffect, useCallback } from 'react';
import { getSales, updateSale, deleteSale } from '../services/api';
import { formatCurrency, formatPercent, formatDate } from '../utils/format';
import { Trash2, Edit2, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SaleStatus from '../domain/models/SaleStatus';

const statusConfig = {
  'Em Produção': { color: 'bg-yellow-100 text-yellow-800', icon: '🏭' },
  'Aguardando Envio': { color: 'bg-blue-100 text-blue-800', icon: '📦' },
  'Enviada': { color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  'Finalizada': { color: 'bg-green-100 text-green-800', icon: '✅' }
};

const SaleList = ({ onEdit }) => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    origemVenda: '',
    dataInicio: '',
    dataFim: '',
    ordenarPor: 'dataCadastro',
    ordem: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSales(filters);
      setSales(data);
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
      setError('Falha ao carregar dados.');
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const applyFilters = useCallback(() => {
    let filtered = [...sales];

    // Filtrar por status
    if (filters.status) {
      filtered = filtered.filter(sale => sale.status === filters.status);
    }

    // Filtrar por origem
    if (filters.origemVenda) {
      filtered = filtered.filter(sale => 
        sale.origemVenda.toLowerCase().includes(filters.origemVenda.toLowerCase())
      );
    }

    // Filtrar por range de data
    if (filters.dataInicio) {
      filtered = filtered.filter(sale => 
        new Date(sale.dataCadastro) >= new Date(filters.dataInicio)
      );
    }

    if (filters.dataFim) {
      filtered = filtered.filter(sale => 
        new Date(sale.dataCadastro) <= new Date(filters.dataFim)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aVal = a[filters.ordenarPor];
      const bVal = b[filters.ordenarPor];
      
      if (filters.ordem === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredSales(filtered);
  }, [sales, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSort = (column) => {
    if (filters.ordenarPor === column) {
      setFilters(prev => ({
        ...prev,
        ordem: prev.ordem === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        ordenarPor: column,
        ordem: 'desc'
      }));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateSale(id, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      fetchSales();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteSale(id);
        toast.success('Venda excluída com sucesso');
        fetchSales();
      } catch (err) {
        console.error('Erro ao deletar:', err);
        toast.error('Erro ao excluir venda');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white shadow-md rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
        >
          <Filter className="w-5 h-5 mr-2" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.keys(SaleStatus).map(key => (
                    <option key={key} value={SaleStatus[key]}>{SaleStatus[key]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origem da Venda</label>
                <input
                  type="text"
                  value={filters.origemVenda}
                  onChange={(e) => setFilters(prev => ({ ...prev, origemVenda: e.target.value }))}
                  placeholder="Buscar por origem..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabela de Vendas */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-64"
              >
                Descrição
              </th>
              <th
                onClick={() => handleSort('dataCadastro')}
                className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Data {filters.ordenarPor === 'dataCadastro' && (filters.ordem === 'asc' ? <ArrowUp className="inline w-4 h-4" /> : <ArrowDown className="inline w-4 h-4" />)}
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Plataforma
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Origem
              </th>
              <th
                onClick={() => handleSort('valorRecebido')}
                className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Valor Recebido {filters.ordenarPor === 'valorRecebido' && (filters.ordem === 'asc' ? <ArrowUp className="inline w-4 h-4" /> : <ArrowDown className="inline w-4 h-4" />)}
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Custos
              </th>
              <th
                onClick={() => handleSort('lucroLiquido')}
                className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Lucro Líquido {filters.ordenarPor === 'lucroLiquido' && (filters.ordem === 'asc' ? <ArrowUp className="inline w-4 h-4" /> : <ArrowDown className="inline w-4 h-4" />)}
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Margem
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg font-semibold">Nenhuma venda encontrada</p>
                  <p className="text-sm">Tente ajustar os filtros ou cadastre uma nova venda</p>
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    <div className="max-w-xs">
                      <span className="text-gray-900 font-medium">
                        {sale.descricao || <span className="text-gray-400 italic">Sem descrição</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    <span className="font-medium text-gray-900">{formatDate(sale.dataCadastro)}</span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                    {sale.plataformaNome}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                    {sale.origemVenda}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm font-semibold text-green-600">
                    {formatCurrency(sale.valorRecebido)}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700">
                    <div className="text-xs space-y-1">
                      <div>Impressão: {formatCurrency(sale.custoImpressao)}</div>
                      <div>Envio: {formatCurrency(sale.custoEnvio)}</div>
                      <div>Plataforma: {formatCurrency(sale.custoVendaPlataforma)} {sale.plataformaPorcentagem && `(${formatPercent(sale.plataformaPorcentagem)})`}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    <span className={`font-semibold ${sale.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(sale.lucroLiquido)}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    <span className={`font-semibold ${sale.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(sale.margemLucro)}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-center">
                    <select
                      value={sale.status}
                      onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[sale.status]?.color || 'bg-gray-100 text-gray-800'}`}
                    >
                      {Object.keys(SaleStatus).map(key => (
                        <option key={key} value={SaleStatus[key]}>{SaleStatus[key]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => onEdit(sale)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      {filteredSales.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Recebido</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(filteredSales.reduce((sum, s) => sum + s.valorRecebido, 0))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Custos</div>
              <div className="text-xl font-bold text-orange-600">
                {formatCurrency(filteredSales.reduce((sum, s) => sum + s.custoImpressao + s.custoEnvio + s.custoVendaPlataforma, 0))}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Lucro</div>
              <div className={`text-xl font-bold ${filteredSales.reduce((sum, s) => sum + s.lucroLiquido, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(filteredSales.reduce((sum, s) => sum + s.lucroLiquido, 0))}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Margem Média</div>
              <div className="text-xl font-bold text-purple-600">
                {formatPercent(
                  filteredSales
                    .filter(s => s.margemLucro !== undefined && s.margemLucro !== null && !isNaN(s.margemLucro))
                    .reduce((sum, s) => sum + s.margemLucro, 0) / 
                  filteredSales.filter(s => s.margemLucro !== undefined && s.margemLucro !== null && !isNaN(s.margemLucro)).length || 0
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleList;