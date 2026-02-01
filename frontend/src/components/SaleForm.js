import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Truck, Store, FileText } from 'lucide-react';
import { createSale, updateSale, getPlatforms } from '../services/api';
import toast from 'react-hot-toast';

const SaleForm = ({ sale, onSubmit, onCancel }) => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valorRecebido: '',
    custoImpressao: '',
    custoEnvio: '',
    plataformaId: '',
    origemVenda: ''
  });

  const origensVenda = [
    'Instagram',
    'Direto da Shopee',
    'Mercado Livre',
    'WhatsApp',
    'Email',
    'Outro'
  ];

  useEffect(() => {
    fetchPlatforms();
    if (sale) {
      setFormData({
        descricao: sale.descricao || '',
        valorRecebido: sale.valorRecebido,
        custoImpressao: sale.custoImpressao,
        custoEnvio: sale.custoEnvio,
        plataformaId: sale.plataformaId,
        origemVenda: sale.origemVenda
      });
    }
  }, [sale]);

  const fetchPlatforms = async () => {
    try {
      const data = await getPlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error('Erro ao carregar plataformas:', error);
      toast.error('Erro ao carregar plataformas');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        descricao: formData.descricao.trim(),
        valorRecebido: parseFloat(formData.valorRecebido),
        custoImpressao: parseFloat(formData.custoImpressao) || 0,
        custoEnvio: parseFloat(formData.custoEnvio) || 0,
        plataformaId: String(formData.plataformaId),
        origemVenda: formData.origemVenda
      };

      if (sale?.id) {
        await updateSale(sale.id, data);
        toast.success('Venda atualizada com sucesso');
      } else {
        await createSale(data);
        toast.success('Venda criada com sucesso');
      }
      
      onSubmit();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Erro ao salvar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <Package className="w-6 h-6 mr-2 text-blue-600" />
        {sale?.id ? 'Editar Venda' : 'Registrar Nova Venda'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Descrição */}
        <div className="mb-4 md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-600" />
            Descrição do Item (opcional)
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva o item vendido (ex: Miniatura de dragão, 15cm altura, cor vermelha)"
            rows="3"
            className="shadow appearance-none border-2 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>
        {/* Valor Recebido */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            Valor Recebido (R$)
          </label>
          <input
            type="number"
            name="valorRecebido"
            value={formData.valorRecebido}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="shadow appearance-none border-2 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Custo da Impressão */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
            <Package className="w-4 h-4 mr-2 text-orange-600" />
            Custo da Impressão (R$)
          </label>
          <input
            type="number"
            name="custoImpressao"
            value={formData.custoImpressao}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="shadow appearance-none border-2 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Custo de Envio */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
            <Truck className="w-4 h-4 mr-2 text-blue-600" />
            Custo de Envio (R$)
          </label>
          <input
            type="number"
            name="custoEnvio"
            value={formData.custoEnvio}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="shadow appearance-none border-2 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Plataforma de Venda */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
            <Store className="w-4 h-4 mr-2 text-purple-600" />
            Plataforma de Venda
          </label>
          <select 
            name="plataformaId"
            value={formData.plataformaId}
            onChange={handleChange}
            className="shadow appearance-none border-2 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
            required
          >
            <option value="">Selecione a plataforma</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>
                {platform.nome} (Taxa: R$ {platform.taxaVenda.toFixed(2)} | {platform.porcentagemComissao}%)
              </option>
            ))}
          </select>
        </div>
        
        {/* Origem da Venda */}
        <div className="mb-4 md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Origem da Venda
          </label>
          <select
            name="origemVenda"
            value={formData.origemVenda}
            onChange={handleChange}
            className="shadow appearance-none border-2 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            required
          >
            <option value="">Selecione a origem</option>
            {origensVenda.map(origem => (
              <option key={origem} value={origem}>
                {origem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end mt-8 space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Salvando...' : sale?.id ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default SaleForm;