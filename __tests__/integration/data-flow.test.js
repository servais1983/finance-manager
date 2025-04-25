/**
 * Tests d'intégration pour le flux de données entre les modules
 */

// Mocks pour simuler les modules
const transactionsModule = {
  getTransactions: jest.fn(),
  addTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn()
};

const budgetsModule = {
  getBudgets: jest.fn(),
  getBudgetByCategory: jest.fn(),
  addBudget: jest.fn(),
  updateBudget: jest.fn(),
  deleteBudget: jest.fn()
};

const goalsModule = {
  getGoals: jest.fn(),
  getGoalById: jest.fn(),
  addGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  addToGoal: jest.fn()
};

// Module d'intégration simulé qui utilise les modules ci-dessus
const dataFlowModule = {
  // Fonction pour générer un rapport de dépenses par catégorie
  generateExpensesByCategoryReport: async (period) => {
    // Récupérer les transactions du mois en cours
    const now = new Date();
    let startDate, endDate;
    
    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else {
      throw new Error('Période non supportée');
    }
    
    const filter = {
      type: 'expense',
      date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    };
    
    const transactions = await transactionsModule.getTransactions(filter);
    
    // Regrouper par catégorie
    const expensesByCategory = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {});
    
    // Récupérer les budgets pour les comparer
    const budgets = await budgetsModule.getBudgets();
    const budgetsByCategory = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.amount;
      return acc;
    }, {});
    
    // Créer le rapport
    const report = Object.keys(expensesByCategory).map(category => {
      const spent = expensesByCategory[category];
      const budget = budgetsByCategory[category] || 0;
      const remaining = Math.max(budget - spent, 0);
      const percentage = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 100;
      
      return {
        category,
        spent,
        budget,
        remaining,
        percentage
      };
    });
    
    return {
      period,
      startDate,
      endDate,
      categories: report
    };
  },
  
  // Fonction pour ajouter une transaction d'épargne et mettre à jour un objectif
  saveToGoal: async (goalId, amount, date, createTransaction = true) => {
    // Récupérer l'objectif
    const goal = await goalsModule.getGoalById(goalId);
    if (!goal) {
      throw new Error('Objectif introuvable');
    }
    
    // Mettre à jour l'objectif
    await goalsModule.addToGoal(goalId, amount);
    
    // Créer une transaction si demandé
    if (createTransaction) {
      const transaction = {
        type: 'expense',
        category: 'Épargne',
        amount,
        description: `Épargne pour: ${goal.name}`,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      await transactionsModule.addTransaction(transaction);
    }
    
    return {
      goalId,
      amount,
      newTotal: goal.current + amount,
      transactionCreated: createTransaction
    };
  },
  
  // Fonction pour vérifier si les budgets sont dépassés
  checkBudgetAlerts: async () => {
    // Récupérer les budgets
    const budgets = await budgetsModule.getBudgets();
    
    // Récupérer les transactions du mois en cours
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const filter = {
      type: 'expense',
      date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    };
    
    const transactions = await transactionsModule.getTransactions(filter);
    
    // Calculer les dépenses par catégorie
    const expensesByCategory = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0;
      }
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {});
    
    // Vérifier les dépassements de budget
    const alerts = [];
    
    budgets.forEach(budget => {
      const spent = expensesByCategory[budget.category] || 0;
      const percentage = Math.round((spent / budget.amount) * 100);
      
      if (percentage >= 90) {
        alerts.push({
          category: budget.category,
          budget: budget.amount,
          spent,
          percentage,
          severity: percentage >= 100 ? 'high' : 'medium'
        });
      }
    });
    
    return alerts;
  }
};

describe('Data Flow Integration', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Configurer les mocks pour simuler des données
    transactionsModule.getTransactions.mockImplementation(filter => {
      const mockTransactions = [
        {
          _id: 'mock-id-1',
          type: 'expense',
          category: 'Logement',
          amount: 900,
          description: 'Loyer mai',
          date: new Date('2025-05-05').toISOString(),
          createdAt: new Date('2025-05-05').toISOString()
        },
        {
          _id: 'mock-id-2',
          type: 'expense',
          category: 'Alimentation',
          amount: 450,
          description: 'Courses semaine',
          date: new Date('2025-05-10').toISOString(),
          createdAt: new Date('2025-05-10').toISOString()
        },
        {
          _id: 'mock-id-3',
          type: 'expense',
          category: 'Loisirs',
          amount: 120,
          description: 'Cinéma',
          date: new Date('2025-05-15').toISOString(),
          createdAt: new Date('2025-05-15').toISOString()
        },
        {
          _id: 'mock-id-4',
          type: 'expense',
          category: 'Épargne',
          amount: 300,
          description: 'Épargne pour: Vacances',
          date: new Date('2025-05-20').toISOString(),
          createdAt: new Date('2025-05-20').toISOString()
        }
      ];
      
      // Filtrage des transactions (simpliste pour les tests)
      return Promise.resolve(mockTransactions.filter(t => {
        if (filter && filter.type && t.type !== filter.type) {
          return false;
        }
        if (filter && filter.category && t.category !== filter.category) {
          return false;
        }
        return true;
      }));
    });
    
    budgetsModule.getBudgets.mockResolvedValue([
      {
        _id: 'mock-budget-1',
        category: 'Logement',
        amount: 1000,
        period: 'monthly'
      },
      {
        _id: 'mock-budget-2',
        category: 'Alimentation',
        amount: 500,
        period: 'monthly'
      },
      {
        _id: 'mock-budget-3',
        category: 'Loisirs',
        amount: 100,
        period: 'monthly'
      }
    ]);
    
    goalsModule.getGoalById.mockImplementation(id => {
      if (id === 'mock-goal-1') {
        return Promise.resolve({
          _id: 'mock-goal-1',
          name: 'Vacances',
          target: 3000,
          current: 1000,
          targetDate: new Date('2025-07-01').toISOString(),
          monthlyContribution: 400
        });
      }
      return Promise.resolve(null);
    });
    
    goalsModule.addToGoal.mockImplementation((id, amount) => {
      if (id === 'mock-goal-1') {
        return Promise.resolve({
          _id: 'mock-goal-1',
          name: 'Vacances',
          target: 3000,
          current: 1000 + amount,
          targetDate: new Date('2025-07-01').toISOString(),
          monthlyContribution: 400
        });
      }
      return Promise.resolve(null);
    });
    
    transactionsModule.addTransaction.mockImplementation(transaction => {
      return Promise.resolve({
        ...transaction,
        _id: 'mock-transaction-' + Math.random().toString(36).substr(2, 9)
      });
    });
  });
  
  test('should generate expense by category report', async () => {
    const report = await dataFlowModule.generateExpensesByCategoryReport('month');
    
    expect(transactionsModule.getTransactions).toHaveBeenCalled();
    expect(budgetsModule.getBudgets).toHaveBeenCalled();
    
    expect(report).toHaveProperty('period', 'month');
    expect(report).toHaveProperty('startDate');
    expect(report).toHaveProperty('endDate');
    expect(report).toHaveProperty('categories');
    
    // Vérifier les catégories du rapport
    const logementCategory = report.categories.find(c => c.category === 'Logement');
    expect(logementCategory).toBeDefined();
    expect(logementCategory.spent).toBe(900);
    expect(logementCategory.budget).toBe(1000);
    expect(logementCategory.remaining).toBe(100);
    expect(logementCategory.percentage).toBe(90);
    
    const loisirsCategory = report.categories.find(c => c.category === 'Loisirs');
    expect(loisirsCategory).toBeDefined();
    expect(loisirsCategory.spent).toBe(120);
    expect(loisirsCategory.budget).toBe(100);
    expect(loisirsCategory.remaining).toBe(0);
    expect(loisirsCategory.percentage).toBe(100);
  });
  
  test('should save to goal and create transaction', async () => {
    const goalId = 'mock-goal-1';
    const amount = 500;
    const date = new Date().toISOString();
    
    const result = await dataFlowModule.saveToGoal(goalId, amount, date, true);
    
    expect(goalsModule.getGoalById).toHaveBeenCalledWith(goalId);
    expect(goalsModule.addToGoal).toHaveBeenCalledWith(goalId, amount);
    expect(transactionsModule.addTransaction).toHaveBeenCalled();
    
    expect(result).toHaveProperty('goalId', goalId);
    expect(result).toHaveProperty('amount', amount);
    expect(result).toHaveProperty('newTotal', 1500); // 1000 + 500
    expect(result).toHaveProperty('transactionCreated', true);
  });
  
  test('should save to goal without creating transaction', async () => {
    const goalId = 'mock-goal-1';
    const amount = 500;
    
    const result = await dataFlowModule.saveToGoal(goalId, amount, null, false);
    
    expect(goalsModule.getGoalById).toHaveBeenCalledWith(goalId);
    expect(goalsModule.addToGoal).toHaveBeenCalledWith(goalId, amount);
    expect(transactionsModule.addTransaction).not.toHaveBeenCalled();
    
    expect(result).toHaveProperty('goalId', goalId);
    expect(result).toHaveProperty('amount', amount);
    expect(result).toHaveProperty('newTotal', 1500); // 1000 + 500
    expect(result).toHaveProperty('transactionCreated', false);
  });
  
  test('should detect budget alerts', async () => {
    const alerts = await dataFlowModule.checkBudgetAlerts();
    
    expect(transactionsModule.getTransactions).toHaveBeenCalled();
    expect(budgetsModule.getBudgets).toHaveBeenCalled();
    
    expect(Array.isArray(alerts)).toBe(true);
    expect(alerts.length).toBe(2);
    
    // Vérifier que le budget de logement est presque dépassé
    const logementAlert = alerts.find(a => a.category === 'Logement');
    expect(logementAlert).toBeDefined();
    expect(logementAlert.percentage).toBe(90);
    expect(logementAlert.severity).toBe('medium');
    
    // Vérifier que le budget de loisirs est dépassé
    const loisirsAlert = alerts.find(a => a.category === 'Loisirs');
    expect(loisirsAlert).toBeDefined();
    expect(loisirsAlert.percentage).toBe(120);
    expect(loisirsAlert.severity).toBe('high');
  });
  
  test('should throw error for non-existent goal', async () => {
    const goalId = 'non-existent-goal';
    const amount = 500;
    
    await expect(dataFlowModule.saveToGoal(goalId, amount)).rejects.toThrow('Objectif introuvable');
    
    expect(goalsModule.getGoalById).toHaveBeenCalledWith(goalId);
    expect(goalsModule.addToGoal).not.toHaveBeenCalled();
    expect(transactionsModule.addTransaction).not.toHaveBeenCalled();
  });
  
  test('should throw error for unsupported period', async () => {
    await expect(dataFlowModule.generateExpensesByCategoryReport('day')).rejects.toThrow('Période non supportée');
    
    expect(transactionsModule.getTransactions).not.toHaveBeenCalled();
    expect(budgetsModule.getBudgets).not.toHaveBeenCalled();
  });
});
