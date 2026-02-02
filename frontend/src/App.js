import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Plus, Settings } from 'lucide-react';
import SaleList from './components/SaleList';
import SaleForm from './components/SaleForm';
import PlatformList from './components/PlatformList';
import './App.css';

function App() {
  const [mostrarFormularioVenda, setMostrarFormularioVenda] = useState(false);
  const [mostrarPlataformas, setMostrarPlataformas] = useState(false);
  const [vendaEditando, setVendaEditando] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNovaVenda = () => {
    setVendaEditando(null);
    setMostrarFormularioVenda(true);
  };

  const handleEditarVenda = (venda) => {
    setVendaEditando(venda);
    setMostrarFormularioVenda(true);
  };

  const handleSalvarVenda = () => {
    setMostrarFormularioVenda(false);
    setVendaEditando(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelarVenda = () => {
    setMostrarFormularioVenda(false);
    setVendaEditando(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🖨️ Calculadora de Ganhos
              </h1>
              <p className="text-gray-600">
                Sistema de gerenciamento de vendas de impressão 3D
              </p>
            </div>
            <div className="flex gap-2">
              {!mostrarFormularioVenda && !mostrarPlataformas && (
                <>
                  <button
                    onClick={handleNovaVenda}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Nova Venda</span>
                  </button>
                  <button
                    onClick={() => setMostrarPlataformas(true)}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                  >
                    <Settings size={20} />
                    <span className="hidden sm:inline">Plataformas</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main>
          {mostrarFormularioVenda ? (
            <div>
              <button
                onClick={handleCancelarVenda}
                className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Voltar para lista de vendas
              </button>
              <SaleForm
                sale={vendaEditando}
                onSubmit={handleSalvarVenda}
                onCancel={handleCancelarVenda}
              />
            </div>
          ) : mostrarPlataformas ? (
            <div>
              <button
                onClick={() => setMostrarPlataformas(false)}
                className="mb-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Voltar para lista de vendas
              </button>
              <PlatformList />
            </div>
          ) : (
            <SaleList onEdit={handleEditarVenda} refreshKey={refreshKey} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;