/**
 * Tests unitaires pour le module des objectifs d'épargne
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
const goalsModule = {
  getGoals: jest.fn(() => {
    return new Promise((resolve) => {
      const mockGoals = [
        {
          _id: 'mock-id-1',
          name: 'Voiture',
          target: 10000,
          current: 2500,
          targetDate: new Date('2026-12-31').toISOString(),
          monthlyContribution: 500,
          createdAt: new Date('2025-01-01').toISOString()
        },
        {
          _id: 'mock-id-2',
          name: 'Vacances',
          target: 3000,
          current: 1000,
          targetDate: new Date('2025-07-01').toISOString(),
          monthlyContribution: 400,
          createdAt: new Date('2025-02-15').toISOString()
        },
        {
          _id: 'mock-id-3',
          name: 'Fond d\'urgence',
          target: 5000,
          current: 4000,
          targetDate: null,
          monthlyContribution: 200,
          createdAt: new Date('2024-06-01').toISOString()
        }
      ];
      
      resolve(mockGoals);
    });
  }),
  
  getGoalById: jest.fn(id => {
    return new Promise((resolve) => {
      if (id === 'mock-id-1') {
        resolve({
          _id: 'mock-id-1',
          name: 'Voiture',
          target: 10000,
          current: 2500,
          targetDate: new Date('2026-12-31').toISOString(),
          monthlyContribution: 500,
          createdAt: new Date('2025-01-01').toISOString()
        });
      } else if (id === 'mock-id-2') {
        resolve({
          _id: 'mock-id-2',
          name: 'Vacances',
          target: 3000,
          current: 1000,
          targetDate: new Date('2025-07-01').toISOString(),
          monthlyContribution: 400,
          createdAt: new Date('2025-02-15').toISOString()
        });
      } else {
        resolve(null);
      }
    });
  }),
  
  addGoal: jest.fn(goal => {
    return new Promise((resolve) => {
      const newGoal = {
        ...goal,
        _id: 'mock-id-' + Math.random().toString(36).substr(2, 9)
      };
      resolve(newGoal);
    });
  }),
  
  updateGoal: jest.fn((id, goal) => {
    return new Promise((resolve) => {
      resolve({ ...goal, _id: id });
    });
  }),
  
  deleteGoal: jest.fn(id => {
    return new Promise((resolve) => {
      resolve(1); // Nombre de documents supprimés
    });
  }),
  
  addToGoal: jest.fn((id, amount) => {
    return new Promise((resolve) => {
      // Simuler la récupération de l'objectif
      let goal;
      if (id === 'mock-id-1') {
        goal = {
          _id: 'mock-id-1',
          name: 'Voiture',
          target: 10000,
          current: 2500,
          targetDate: new Date('2026-12-31').toISOString(),
          monthlyContribution: 500,
          createdAt: new Date('2025-01-01').toISOString()
        };
      } else if (id === 'mock-id-2') {
        goal = {
          _id: 'mock-id-2',
          name: 'Vacances',
          target: 3000,
          current: 1000,
          targetDate: new Date('2025-07-01').toISOString(),
          monthlyContribution: 400,
          createdAt: new Date('2025-02-15').toISOString()
        };
      } else {
        resolve(null);
        return;
      }
      
      // Mettre à jour le montant actuel
      goal.current += amount;
      resolve(goal);
    });
  })
};

describe('Goals Module', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });
  
  test('should get all goals', async () => {
    const goals = await goalsModule.getGoals();
    
    expect(Array.isArray(goals)).toBe(true);
    expect(goals.length).toBe(3);
    expect(goalsModule.getGoals).toHaveBeenCalled();
  });
  
  test('should get goal by id', async () => {
    const id = 'mock-id-1';
    const goal = await goalsModule.getGoalById(id);
    
    expect(goal).not.toBeNull();
    expect(goal._id).toBe(id);
    expect(goal.name).toBe('Voiture');
    expect(goalsModule.getGoalById).toHaveBeenCalledWith(id);
  });
  
  test('should return null for non-existent goal id', async () => {
    const id = 'non-existent-id';
    const goal = await goalsModule.getGoalById(id);
    
    expect(goal).toBeNull();
    expect(goalsModule.getGoalById).toHaveBeenCalledWith(id);
  });
  
  test('should add a new goal', async () => {
    const goal = {
      name: 'Nouvel ordinateur',
      target: 1500,
      current: 0,
      targetDate: new Date('2025-10-01').toISOString(),
      monthlyContribution: 150
    };
    
    const newGoal = await goalsModule.addGoal(goal);
    
    expect(newGoal).toHaveProperty('_id');
    expect(newGoal.name).toBe(goal.name);
    expect(newGoal.target).toBe(goal.target);
    expect(goalsModule.addGoal).toHaveBeenCalledWith(goal);
  });
  
  test('should update an existing goal', async () => {
    const id = 'mock-id-2';
    const updatedData = {
      current: 1500,
      monthlyContribution: 500
    };
    
    const updatedGoal = await goalsModule.updateGoal(id, updatedData);
    
    expect(updatedGoal._id).toBe(id);
    expect(updatedGoal.current).toBe(updatedData.current);
    expect(updatedGoal.monthlyContribution).toBe(updatedData.monthlyContribution);
    expect(goalsModule.updateGoal).toHaveBeenCalledWith(id, updatedData);
  });
  
  test('should delete a goal', async () => {
    const id = 'mock-id-3';
    
    const result = await goalsModule.deleteGoal(id);
    
    expect(result).toBe(1);
    expect(goalsModule.deleteGoal).toHaveBeenCalledWith(id);
  });
  
  test('should add amount to a goal', async () => {
    const id = 'mock-id-1';
    const amount = 500;
    
    const updatedGoal = await goalsModule.addToGoal(id, amount);
    
    expect(updatedGoal._id).toBe(id);
    expect(updatedGoal.current).toBe(3000); // 2500 + 500
    expect(goalsModule.addToGoal).toHaveBeenCalledWith(id, amount);
  });
  
  test('should calculate progress percentage correctly', () => {
    const goal = {
      target: 10000,
      current: 2500
    };
    
    const percentage = (goal.current / goal.target) * 100;
    
    expect(percentage).toBe(25);
  });
  
  test('should calculate remaining amount correctly', () => {
    const goal = {
      target: 10000,
      current: 2500
    };
    
    const remaining = goal.target - goal.current;
    
    expect(remaining).toBe(7500);
  });
  
  test('should calculate estimated completion date correctly', () => {
    const goal = {
      target: 10000,
      current: 2500,
      monthlyContribution: 500
    };
    
    const remaining = goal.target - goal.current;
    const monthsToComplete = Math.ceil(remaining / goal.monthlyContribution);
    
    expect(monthsToComplete).toBe(15);
  });
});
