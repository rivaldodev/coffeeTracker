import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Settings, Trash2, Edit3, Check, X, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const handleUpdate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.updateUser(user.id, { name });
      updateUser(updated);
      setIsEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteUser(user.id);
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar conta');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3E2723] flex items-center gap-3">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-[#D2691E]" />
          Configurações
        </h1>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 text-sm border border-red-100">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 text-sm border border-green-100">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col items-center border-b border-gray-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#EFEBE9] rounded-full flex items-center justify-center mb-4 shadow-inner">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#5A3A22]" />
          </div>
          
          {isEditing ? (
            <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D2691E] focus:border-transparent outline-none text-center font-semibold text-[#3E2723]"
                autoFocus
              />
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button 
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 sm:flex-none p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex justify-center"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setName(user.name); }}
                  disabled={loading}
                  className="flex-1 sm:flex-none p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#3E2723] text-center">{user.name}</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-[#D2691E] hover:bg-orange-50 rounded-full transition-colors shrink-0"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm sm:text-base text-gray-500 mt-1 text-center">{user.email}</p>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Membro desde {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </h3>
          
          {showDeleteConfirm ? (
            <div className="bg-red-50 p-4 sm:p-6 rounded-2xl border border-red-100">
              <p className="text-red-800 text-sm sm:text-base font-medium mb-4 text-center sm:text-left">
                Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todo o seu histórico de cafés será perdido.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  {loading ? 'Excluindo...' : 'Sim, excluir conta'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Excluir minha conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
