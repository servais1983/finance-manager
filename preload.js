const { contextBridge, ipcRenderer } = require('electron');

// Exposer les API Electron au processus de rendu de manière sécurisée
contextBridge.exposeInMainWorld('api', {
  // Transactions
  getTransactions: (filter) => ipcRenderer.invoke('get-transactions', filter),
  addTransaction: (transaction) => ipcRenderer.invoke('add-transaction', transaction),
  updateTransaction: (id, transaction) => ipcRenderer.invoke('update-transaction', id, transaction),
  deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
  
  // Budgets
  getBudgets: () => ipcRenderer.invoke('get-budgets'),
  addBudget: (budget) => ipcRenderer.invoke('add-budget', budget),
  updateBudget: (id, budget) => ipcRenderer.invoke('update-budget', id, budget),
  deleteBudget: (id) => ipcRenderer.invoke('delete-budget', id),
  
  // Objectifs d'épargne
  getGoals: () => ipcRenderer.invoke('get-goals'),
  addGoal: (goal) => ipcRenderer.invoke('add-goal', goal),
  updateGoal: (id, goal) => ipcRenderer.invoke('update-goal', id, goal),
  deleteGoal: (id) => ipcRenderer.invoke('delete-goal', id),
  
  // Paramètres
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  
  // Réinitialisation des données (pour les tests)
  resetData: () => ipcRenderer.invoke('reset-data'),
  
  // Utilitaires
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  },
  
  // Catégories prédéfinies
  categories: {
    income: ['Salaire', 'Freelance', 'Cadeaux', 'Remboursements', 'Autres revenus'],
    expense: ['Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Éducation', 'Habillement', 'Factures', 'Épargne', 'Divers']
  }
});