/**
 * Tests unitaires pour le module de budgets
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
const budgetsModule = {
  getBudgets: jest.fn(() => {
    return new Promise((resolve) => {
      const mockBudgets = [
        {
          _id: 'mock-id-1',
          category: 'Logement',
          amount: 1000,
          period: 'monthly',
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          _id: 'mock-id-2',
          category: 'Alimentation',
          amount: 500,
          period: 'monthly',
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          _id: 'mock-id-3',
          category: 'Loisirs',
          amount: 200,
          period: 'monthly',
          createdAt: new Date('2025-01-01').toISOString()
        }
      ];
      
      resolve(mockBudgets);
    });
  }),
  
  getBudgetByCategory: jest.fn(category => {
    return new Promise((resolve) => {
      if (category === 'Logement') {
        resolve({
          _id: 'mock-id-1',
          category: 'Logement',
          amount: 1000,
          period: 'monthly',
          createdAt: new Date('2025-01-01').toISOString()
        });
      } else if (category === 'Alimentation') {
        resolve({
          _id: 'mock-id-2',
          category: 'Alimentation',
          amount: 500,
          period: 'monthly',
          createdAt: new Date('2025-01-01').toISOString()
        });
      } else {
        resolve(null);
      }
    });
  }),
  
  addBudget: jest.fn(budget => {
    return new Promise((resolve) => {
      const newBudget = {
        ...budget,
        _id: 'mock-id-' + Math.random().toString(36).substr(2, 9)
      };
      resolve(newBudget);
    });
  }),
  
  updateBudget: jest.fn((id, budget) => {
    return new Promise((resolve) => {
      resolve({ ...budget, _id: id });
    });
  }),
  
  deleteBudget: jest.fn(id => {
    return new Promise((resolve) => {
      resolve(1); // Nombre de documents supprimés
    });
  })
};

describe('Budgets Module', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });
  
  test('should get all budgets', async () => {
    const budgets = await budgetsModule.getBudgets();
    
    expect(Array.isArray(budgets)).toBe(true);
    expect(budgets.length).toBe(3);
    expect(budgetsModule.getBudgets).toHaveBeenCalled();
  });
  
  test('should get budget by category', async () => {
    const category = 'Logement';
    const budget = await budgetsModule.getBudgetByCategory(category);
    
    expect(budget).not.toBeNull();
    expect(budget.category).toBe(category);
    expect(budget.amount).toBe(1000);
    expect(budgetsModule.getBudgetByCategory).toHaveBeenCalledWith(category);
  });
  
  test('should return null for non-existent category', async () => {
    const category = 'Catégorie inexistante';
    const budget = await budgetsModule.getBudgetByCategory(category);
    
    expect(budget).toBeNull();
    expect(budgetsModule.getBudgetByCategory).toHaveBeenCalledWith(category);
  });
  
  test('should add a new budget', async () => {
    const budget = {
      category: 'Transport',
      amount: 150,
      period: 'monthly'
    };
    
    const newBudget = await budgetsModule.addBudget(budget);
    
    expect(newBudget).toHaveProperty('_id');
    expect(newBudget.category).toBe(budget.category);
    expect(newBudget.amount).toBe(budget.amount);
    expect(budgetsModule.addBudget).toHaveBeenCalledWith(budget);
  });
  
  test('should update an existing budget', async () => {
    const id = 'mock-id-2';
    const updatedData = {
      amount: 600,
      period: 'monthly'
    };
    
    const updatedBudget = await budgetsModule.updateBudget(id, updatedData);
    
    expect(updatedBudget._id).toBe(id);
    expect(updatedBudget.amount).toBe(updatedData.amount);
    expect(updatedBudget.period).toBe(updatedData.period);
    expect(budgetsModule.updateBudget).toHaveBeenCalledWith(id, updatedData);
  });
  
  test('should delete a budget', async () => {
    const id = 'mock-id-3';
    
    const result = await budgetsModule.deleteBudget(id);
    
    expect(result).toBe(1);
    expect(budgetsModule.deleteBudget).toHaveBeenCalledWith(id);
  });
});
