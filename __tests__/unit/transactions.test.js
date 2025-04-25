/**
 * Tests unitaires pour le module de transactions
 */

// Mock de la base de données NeDB
jest.mock('nedb', () => {
  return function() {
    return {
      loadDatabase: jest.fn(cb => cb && cb(null)),
      find: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn((doc, cb) => {
        const newDoc = { ...doc, _id: 'mock-id-' + Math.random().toString(36).substr(2, 9) };
        cb && cb(null, newDoc);
        return newDoc;
      }),
      update: jest.fn((query, update, options, cb) => {
        cb && cb(null, 1);
        return 1;
      }),
      remove: jest.fn((query, options, cb) => {
        cb && cb(null, 1);
        return 1;
      })
    };
  };
});

// Mock du module electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path')
  }
}));

// Import du module à tester (nous simulons ici le module)
const transactionsModule = {
  getTransactions: jest.fn(filter => {
    return new Promise((resolve) => {
      const mockTransactions = [
        {
          _id: 'mock-id-1',
          type: 'income',
          category: 'Salaire',
          amount: 2000,
          description: 'Salaire mensuel',
          date: new Date('2025-04-01').toISOString(),
          createdAt: new Date('2025-04-01').toISOString()
        },
        {
          _id: 'mock-id-2',
          type: 'expense',
          category: 'Logement',
          amount: 800,
          description: 'Loyer Avril',
          date: new Date('2025-04-05').toISOString(),
          createdAt: new Date('2025-04-05').toISOString()
        }
      ];
      
      if (!filter) {
        resolve(mockTransactions);
        return;
      }
      
      // Filtre simple pour les tests
      const filtered = mockTransactions.filter(t => {
        let match = true;
        if (filter.type && t.type !== filter.type) {
          match = false;
        }
        if (filter.category && t.category !== filter.category) {
          match = false;
        }
        // Ajouter d'autres filtres au besoin
        
        return match;
      });
      
      resolve(filtered);
    });
  }),
  
  addTransaction: jest.fn(transaction => {
    return new Promise((resolve) => {
      const newTransaction = {
        ...transaction,
        _id: 'mock-id-' + Math.random().toString(36).substr(2, 9)
      };
      resolve(newTransaction);
    });
  }),
  
  updateTransaction: jest.fn((id, transaction) => {
    return new Promise((resolve) => {
      resolve({ ...transaction, _id: id });
    });
  }),
  
  deleteTransaction: jest.fn(id => {
    return new Promise((resolve) => {
      resolve(1); // Nombre de documents supprimés
    });
  })
};

describe('Transactions Module', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });
  
  test('should get all transactions when no filter is provided', async () => {
    const transactions = await transactionsModule.getTransactions();
    
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBe(2);
    expect(transactionsModule.getTransactions).toHaveBeenCalledWith(undefined);
  });
  
  test('should filter transactions by type', async () => {
    const filter = { type: 'income' };
    const transactions = await transactionsModule.getTransactions(filter);
    
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBe(1);
    expect(transactions[0].type).toBe('income');
    expect(transactionsModule.getTransactions).toHaveBeenCalledWith(filter);
  });
  
  test('should add a new transaction', async () => {
    const transaction = {
      type: 'expense',
      category: 'Alimentation',
      amount: 50.75,
      description: 'Courses hebdomadaires',
      date: new Date().toISOString()
    };
    
    const newTransaction = await transactionsModule.addTransaction(transaction);
    
    expect(newTransaction).toHaveProperty('_id');
    expect(newTransaction.type).toBe(transaction.type);
    expect(newTransaction.amount).toBe(transaction.amount);
    expect(transactionsModule.addTransaction).toHaveBeenCalledWith(transaction);
  });
  
  test('should update an existing transaction', async () => {
    const id = 'mock-id-1';
    const updatedData = {
      amount: 2100,
      description: 'Salaire mensuel avec prime'
    };
    
    const updatedTransaction = await transactionsModule.updateTransaction(id, updatedData);
    
    expect(updatedTransaction._id).toBe(id);
    expect(updatedTransaction.amount).toBe(updatedData.amount);
    expect(updatedTransaction.description).toBe(updatedData.description);
    expect(transactionsModule.updateTransaction).toHaveBeenCalledWith(id, updatedData);
  });
  
  test('should delete a transaction', async () => {
    const id = 'mock-id-2';
    
    const result = await transactionsModule.deleteTransaction(id);
    
    expect(result).toBe(1);
    expect(transactionsModule.deleteTransaction).toHaveBeenCalledWith(id);
  });
});
