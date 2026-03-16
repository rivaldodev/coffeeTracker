import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DrinkRecord } from '../types';
import { Coffee, Plus, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [history, setHistory] = useState<DrinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadHistory = async (isSilent = false) => {
    if (!user || !user.id) return;
    if (!isSilent) setLoading(true);
    try {
      const data = await api.getHistory(user.id, today);
      // If we're doing a silent refresh and data is empty but we have local history, 
      // maybe the backend is just lagging. Let's be careful not to wipe it.
      if (isSilent && data.length === 0 && history.length > 0) {
         return;
      }
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]); // Only re-run if ID changes

  const handleAddCoffee = async () => {
    if (!user) return;
    setAdding(true);
    try {
      const newDrink = await api.registerDrink(user.id);
      
      // Optimistic update
      setHistory(prev => [newDrink, ...prev]);
      
      // Refresh User Profile to update any global counters
      const updatedUser = await api.getUser(user.id);
      updateUser(updatedUser);
      
      // Refresh history silently after a delay
      setTimeout(() => loadHistory(true), 1500);
    } catch (error) {
      console.error('Failed to register drink', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#D2691E] to-[#5A3A22]" />
        
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3E2723] mb-2">
          Hora do Café! ☕
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mb-8 max-w-md">
          Registre cada xícara e acompanhe seu consumo diário.
        </p>

        <button
          onClick={handleAddCoffee}
          disabled={adding}
          className="group relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 bg-[#5A3A22] text-white rounded-full shadow-xl hover:bg-[#3E2723] hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {adding ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <div className="flex flex-col items-center">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 mb-1" />
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
            </div>
          )}
        </button>
        
        <div className="mt-8 pt-6 border-t border-gray-100 w-full">
          <div className="flex justify-center items-center gap-2 text-2xl font-bold text-[#D2691E]">
            <span>{history.length}</span>
            <span className="text-gray-400 text-base sm:text-lg font-normal">
              {history.length === 1 ? 'café hoje' : 'cafés hoje'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#3E2723] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D2691E]" />
            Histórico de Hoje
          </h2>
          <span className="text-xs sm:text-sm text-gray-500 capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D2691E] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">Nenhum café registrado hoje ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Clique no botão acima para começar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={record.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-[#F5F5F0] rounded-full flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-[#5A3A22]" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-[#3E2723] truncate">
                      {record.drink || 'Café consumido'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(() => {
                        try {
                          const date = new Date(record.consumedAt);
                          return isNaN(date.getTime()) ? '--:--' : format(date, "HH:mm");
                        } catch (e) {
                          return '--:--';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-[#D2691E] shrink-0 ml-2">
                  {record.amountMl ? `+${record.amountMl}` : '+1'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
