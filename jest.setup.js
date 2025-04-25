/**
 * Configuration de l'environnement pour les tests Jest
 */

// Mock pour éviter les problèmes avec le module 'fs'
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn()
}));

// Mock pour éviter les problèmes avec electron-store
jest.mock('electron-store', () => {
  return function() {
    return {
      store: {},
      get: jest.fn((key) => {
        if (key === 'categories') {
          return {
            income: ['Salaire', 'Freelance', 'Cadeaux', 'Remboursements', 'Autres revenus'],
            expense: ['Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Éducation', 'Habillement', 'Factures', 'Épargne', 'Divers']
          };
        }
        return this.store[key];
      }),
      set: jest.fn((key, value) => {
        this.store[key] = value;
      }),
      has: jest.fn(() => true),
      delete: jest.fn()
    };
  };
});

// Pour que Chart.js fonctionne en environnement de test
jest.mock('chart.js', () => {
  return {
    Chart: class {
      constructor() {}
      static register() {}
    }
  };
});

// Mock pour le localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock pour les fonctions de fenêtre
global.alert = jest.fn();
global.confirm = jest.fn().mockReturnValue(true);

// Mock pour le DOM pour les tests sans interface
if (typeof document === 'undefined') {
  class LocalStorageMock {
    constructor() {
      this.store = {};
    }
    getItem(key) {
      return this.store[key] || null;
    }
    setItem(key, value) {
      this.store[key] = value.toString();
    }
    removeItem(key) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
  }

  global.localStorage = new LocalStorageMock();

  global.document = {
    getElementById: jest.fn().mockReturnValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      innerHTML: '',
      checked: false,
      style: {}
    }),
    querySelector: jest.fn().mockReturnValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      value: '',
      innerHTML: '',
      style: {}
    }),
    querySelectorAll: jest.fn().mockReturnValue([]),
    createElement: jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
      style: {},
      addEventListener: jest.fn(),
      textContent: '',
      className: '',
      id: ''
    }),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn().mockReturnValue(false)
      }
    }
  };

  global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    location: {
      reload: jest.fn()
    },
    api: {
      getTransactions: jest.fn().mockResolvedValue([]),
      addTransaction: jest.fn().mockResolvedValue({}),
      updateTransaction: jest.fn().mockResolvedValue({}),
      deleteTransaction: jest.fn().mockResolvedValue(1),
      getBudgets: jest.fn().mockResolvedValue([]),
      addBudget: jest.fn().mockResolvedValue({}),
      updateBudget: jest.fn().mockResolvedValue({}),
      deleteBudget: jest.fn().mockResolvedValue(1),
      getGoals: jest.fn().mockResolvedValue([]),
      addGoal: jest.fn().mockResolvedValue({}),
      updateGoal: jest.fn().mockResolvedValue({}),
      deleteGoal: jest.fn().mockResolvedValue(1),
      getSettings: jest.fn().mockResolvedValue({}),
      updateSettings: jest.fn().mockResolvedValue({}),
      formatCurrency: jest.fn((amount) => `${amount} €`),
      categories: {
        income: ['Salaire', 'Freelance', 'Cadeaux', 'Remboursements', 'Autres revenus'],
        expense: ['Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Éducation', 'Habillement', 'Factures', 'Épargne', 'Divers']
      }
    }
  };
}

// Ajouter une fonction d'attente pour les tests asynchrones
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('Jest setup completed');
