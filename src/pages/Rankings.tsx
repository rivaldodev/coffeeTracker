import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RankingEntry } from '../types';
import { Trophy, Calendar, Medal, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export const Rankings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'day' | 'last'>('day');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  const loadRanking = async () => {
    setLoading(true);
    try {
      if (activeTab === 'day') {
        const data = await api.getDailyRanking(today);
        setRanking(data);
      } else {
        const data = await api.getLastDaysRanking(7);
        setRanking(data);
      }
    } catch (error) {
      console.error('Failed to load ranking', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3E2723] flex items-center gap-3">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#D2691E]" />
          Ranking
        </h1>
      </motion.div>

      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('day')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'day'
              ? 'bg-[#5A3A22] text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => setActiveTab('last')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'last'
              ? 'bg-[#5A3A22] text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Últimos 7 Dias
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-semibold text-[#3E2723] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D2691E]" />
            {activeTab === 'day' ? 'Ranking Diário' : 'Ranking Semanal'}
          </h2>
          <span className="text-xs sm:text-sm text-gray-500">
            {activeTab === 'day' ? format(new Date(), "dd/MM/yyyy") : 'Últimos 7 dias'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D2691E] animate-spin" />
          </div>
        ) : ranking.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Nenhum café registrado neste período.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ranking.map((entry, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={entry.userId}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index < 3 ? <Medal className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#3E2723] truncate">{entry.userName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {index === 0 ? 'Líder do ranking' : 'Participante'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                  <span className="text-lg sm:text-xl font-bold text-[#D2691E]">{entry.totalDrinks}</span>
                  <span className="text-xs sm:text-sm text-gray-500">cafés</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
