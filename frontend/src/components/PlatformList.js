import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlatforms, createPlatform, updatePlatform, deletePlatform } from '../services/api';

const PlatformList = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    taxaVenda: '',
    porcentagemComissao: ''
  });
  const [erros, setErros] = useState({});

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const data = await getPlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error('Erro ao carregar plataformas:', error);
      toast.error('Erro ao carregar plataformas');
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setEditando(null);
    setFormData({ nome: '', taxaVenda: '', porcentagemComissao: '' });
    setErros({});
    setMostrarFormulario(true);
  };

  const handleEditar = (plataforma) => {
    setEditando(plataforma);
    setFormData({
      nome: plataforma.nome,
      taxaVenda: plataforma.taxaVenda.toString(),
      porcentagemComissao: plataforma.porcentagemComissao.toString()
    });
    setErros({});
    setMostrarFormulario(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validar = () => {
    const novosErros = {};

    if (!formData.nome || formData.nome.trim().length === 0) {
      novosErros.nome = 'Nome da plataforma é obrigatório';
    }

    if (formData.taxaVenda === '' || parseFloat(formData.taxaVenda) < 0) {
      novosErros.taxaVenda = 'Taxa de venda é inválida';
    }

    if (formData.porcentagemComissao === '' || parseFloat(formData.porcentagemComissao) < 0) {
      novosErros.porcentagemComissao = 'Porcentagem de comissão é inválida';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      const dados = {
        nome: formData.nome.trim(),
        taxaVenda: parseFloat(formData.taxaVenda),
        porcentagemComissao: parseFloat(formData.porcentagemComissao)
      };

      if (editando) {
        await updatePlatform(editando.id, dados);
        toast.success('Plataforma atualizada com sucesso!');
      } else {
        await createPlatform(dados);
        toast.success('Plataforma criada com sucesso!');
      }

      setMostrarFormulario(false);
      fetchPlatforms();
    } catch (error) {
      console.error('Erro ao salvar plataforma:', error);
      toast.error('Erro ao salvar plataforma. Tente novamente.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta plataforma?')) {
      try {
        await deletePlatform(id);
        toast.success('Plataforma removida com sucesso!');
        fetchPlatforms();
      } catch (error) {
        console.error('Erro ao excluir plataforma:', error);
        toast.error('Erro ao excluir plataforma.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (mostrarFormulario) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editando ? '✏️ Editar Plataforma' : '➕ Nova Plataforma'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Plataforma *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Shopee, Mercado Livre, Instagram"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all ${erros.nome ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {erros.nome && (
                <p className="text-red-500 text-sm mt-1">{erros.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa Fixa de Venda (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  name="taxaVenda"
                  value={formData.taxaVenda}
                  onChange={handleChange}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all ${erros.taxaVenda ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              {erros.taxaVenda && (
                <p className="text-red-500 text-sm mt-1">{erros.taxaVenda}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentagem de Comissão (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="porcentagemComissao"
                  value={formData.porcentagemComissao}
                  onChange={handleChange}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all ${erros.porcentagemComissao ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                  %
                </span>
              </div>
              {erros.porcentagemComissao && (
                <p className="text-red-500 text-sm mt-1">{erros.porcentagemComissao}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {editando ? 'Atualizar' : 'Criar'} Plataforma
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={24} />
            Plataformas de Venda
          </h2>
          <button
            onClick={handleNovo}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Edit2 size={20} />
            <span className="hidden sm:inline">Nova</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {platforms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-lg font-medium">Nenhuma plataforma cadastrada</p>
            <p className="text-sm mt-2">Clique em "Nova" para adicionar sua primeira plataforma</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {platforms.map((plataforma, index) => (
                <motion.div
                  key={plataforma.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-800">
                      {plataforma.nome}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(plataforma)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleExcluir(plataforma.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa Fixa:</span>
                      <span className="font-semibold text-gray-800">
                        R$ {plataforma.taxaVenda.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comissão:</span>
                      <span className="font-semibold text-gray-800">
                        {plataforma.porcentagemComissao}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformList;