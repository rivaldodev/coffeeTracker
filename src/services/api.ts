import { AuthResponse, DrinkRecord, RankingEntry, User, API_BASE_URL, getAuthHeaders, USE_MOCK_API } from '../types';

// Simple mock data store
let mockUsers: User[] = [
  { id: 1, name: 'Rivaldo Freitas', email: 'rivaldo.freitas.106@gmail.com', createdAt: new Date().toISOString() }
];

let mockDrinks: { id: number, userId: number, consumedAt: string, drink: string }[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mapDrinkRecord = (d: any): DrinkRecord => {
  const quantity = d.amountMl || d.quantity || (typeof d.drink === 'number' ? d.drink : 0);
  return {
    ...d,
    id: d.id || d.iduser,
    userId: d.userId || d.iduser,
    consumedAt: d.consumedAt || d.drinkTimestamp || d.createdAt,
    drink: typeof d.drink === 'number' ? `Café (${d.drink}ml)` : (d.drink || 'Café'),
    amountMl: quantity
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      await delay(500);
      const user = mockUsers.find(u => u.email === email);
      if (!user) throw new Error('Credenciais inválidas');
      return { token: 'mock-jwt-token-123', user };
    }
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Falha no login');
    const data = await res.json();
    
    let { token, user } = data;
    
    if (token && !user) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        const userId = payload.sub;
        
        if (userId) {
          const userRes = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userRes.ok) {
            user = await userRes.json();
            if (!user.id && user.iduser) {
              user.id = user.iduser;
            }
          }
        }
      } catch (e) {
        console.error('[API] Error during JWT decode or user fetch:', e);
      }
    }
    
    return { token, user };
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    if (USE_MOCK_API) {
      await delay(500);
      if (mockUsers.some(u => u.email === email)) throw new Error('Email já em uso');
      const newUser = { id: mockUsers.length + 1, name, email, createdAt: new Date().toISOString() };
      mockUsers.push(newUser);
      return newUser;
    }
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error('Falha no registro');
    const newUser = await res.json();
    return !newUser.id && newUser.iduser ? { ...newUser, id: newUser.iduser } : newUser;
  },

  // Users
  getUser: async (id: number): Promise<User> => {
    if (USE_MOCK_API) {
      await delay(300);
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('Usuário não encontrado');
      return user;
    }
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Falha ao buscar usuário');
    const data = await res.json();
    if (!data.id && data.iduser) {
      return { ...data, id: data.iduser };
    }
    return data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    if (USE_MOCK_API) {
      await delay(500);
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuário não encontrado');
      mockUsers[index] = { ...mockUsers[index], ...data };
      return mockUsers[index];
    }
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar usuário');
    
    const text = await res.text();
    if (!text) {
      return { ...data, id } as User;
    }
    
    const updatedUser = JSON.parse(text);
    return !updatedUser.id && updatedUser.iduser ? { ...updatedUser, id: updatedUser.iduser } : updatedUser;
  },

  deleteUser: async (id: number): Promise<void> => {
    if (USE_MOCK_API) {
      await delay(500);
      mockUsers = mockUsers.filter(u => u.id !== id);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao deletar usuário');
  },

  // Drinks
  registerDrink: async (userId: number, drink: number = 200): Promise<DrinkRecord> => {
    if (USE_MOCK_API) {
      await delay(300);
      const newDrink = mapDrinkRecord({ id: mockDrinks.length + 1, userId, consumedAt: new Date().toISOString(), drink });
      mockDrinks.push(newDrink as any);
      return newDrink;
    }
    const res = await fetch(`${API_BASE_URL}/users/${userId}/drink`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ drink }),
    });
    if (!res.ok) throw new Error('Falha ao registrar consumo');
    
    const text = await res.text();
    if (!text) {
      return mapDrinkRecord({ userId, consumedAt: new Date().toISOString(), drink });
    }
    
    const data = JSON.parse(text);
    return mapDrinkRecord(data);
  },

  getHistory: async (userId: number, date: string): Promise<DrinkRecord[]> => {
    if (USE_MOCK_API) {
      await delay(500);
      return mockDrinks
        .filter(d => d.userId === userId && d.consumedAt.startsWith(date))
        .sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime());
    }
    const res = await fetch(`${API_BASE_URL}/users/${userId}/history?date=${date}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar histórico');
    const data = await res.json();
    let history = Array.isArray(data) ? data : (data.content || []);
    return history.map(mapDrinkRecord);
  },

  // Rankings
  getDailyRanking: async (date: string): Promise<RankingEntry[]> => {
    if (USE_MOCK_API) {
      await delay(400);
      const counts: Record<number, number> = {};
      mockDrinks.forEach(d => {
        if (d.consumedAt.startsWith(date)) {
          counts[d.userId] = (counts[d.userId] || 0) + 1;
        }
      });
      return Object.entries(counts).map(([userIdStr, totalDrinks]) => {
        const userId = parseInt(userIdStr);
        const user = mockUsers.find(u => u.id === userId);
        return { userId, userName: user?.name || 'Desconhecido', totalDrinks };
      }).sort((a, b) => b.totalDrinks - a.totalDrinks);
    }
    const res = await fetch(`${API_BASE_URL}/ranking/day?date=${date}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar ranking diário');
    const data = await res.json();
    const rankings = Array.isArray(data) ? data : (data.content || []);
    return rankings.map((r: any) => ({
      ...r,
      userId: r.userId || r.iduser || r.id,
      userName: r.userName || r.name || 'Desconhecido',
      totalDrinks: r.totalDrinks || r.drinkCounter || 0
    }));
  },

  getLastDaysRanking: async (days: number): Promise<RankingEntry[]> => {
    if (USE_MOCK_API) {
      await delay(400);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      
      const counts: Record<number, number> = {};
      mockDrinks.forEach(d => {
        if (new Date(d.consumedAt) >= cutoff) {
          counts[d.userId] = (counts[d.userId] || 0) + 1;
        }
      });
      return Object.entries(counts).map(([userIdStr, totalDrinks]) => {
        const userId = parseInt(userIdStr);
        const user = mockUsers.find(u => u.id === userId);
        return { userId, userName: user?.name || 'Desconhecido', totalDrinks };
      }).sort((a, b) => b.totalDrinks - a.totalDrinks);
    }
    const res = await fetch(`${API_BASE_URL}/ranking/last?days=${days}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar ranking dos últimos dias');
    const data = await res.json();
    const rankings = Array.isArray(data) ? data : (data.content || []);
    return rankings.map((r: any) => ({
      ...r,
      userId: r.userId || r.iduser || r.id,
      userName: r.userName || r.name || 'Desconhecido',
      totalDrinks: r.totalDrinks || r.drinkCounter || 0
    }));
  }
};
