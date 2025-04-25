/**
 * Tests d'interface utilisateur avec Spectron
 * 
 * Pour exécuter ces tests, vous devrez d'abord installer Spectron:
 * npm install --save-dev spectron
 */

const { Application } = require('spectron');
const path = require('path');
const electron = require('electron');

describe('Application Launch', function() {
  jest.setTimeout(10000); // Augmente le timeout car le lancement de l'app peut prendre du temps
  
  let app;
  
  beforeEach(function() {
    app = new Application({
      path: electron,
      args: [path.join(__dirname, '../../')],
      env: {
        NODE_ENV: 'test'
      }
    });
    
    return app.start();
  });
  
  afterEach(function() {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });
  
  test('shows the main window', async function() {
    // Attendre que la fenêtre soit visible
    await app.client.waitUntilWindowLoaded();
    
    // Vérifier qu'une seule fenêtre est ouverte
    const count = await app.client.getWindowCount();
    expect(count).toBe(1);
    
    // Vérifier que la fenêtre est visible
    const isVisible = await app.browserWindow.isVisible();
    expect(isVisible).toBe(true);
    
    // Vérifier que la taille de la fenêtre est correcte
    const { width, height } = await app.browserWindow.getSize();
    expect(width).toBeGreaterThan(800);
    expect(height).toBeGreaterThan(600);
  });
  
  test('shows the app title', async function() {
    // Attendre que la fenêtre soit chargée
    await app.client.waitUntilWindowLoaded();
    
    // Vérifier le titre de la fenêtre
    const title = await app.browserWindow.getTitle();
    expect(title).toBe('Finance Manager');
  });
  
  test('sidebar contains navigation links', async function() {
    // Attendre que le contenu soit chargé
    await app.client.waitUntilWindowLoaded();
    
    // Vérifier que la sidebar est présente
    const sidebar = await app.client.$('#sidebar');
    expect(await sidebar.isExisting()).toBe(true);
    
    // Vérifier que tous les liens de navigation sont présents
    const navLinks = await app.client.$$('.list-group-item');
    expect(navLinks.length).toBe(6); // Tableau de bord, Transactions, Budgets, Objectifs, Rapports, Paramètres
    
    // Vérifier le texte d'un des liens
    const dashboardLink = await app.client.$('.list-group-item[data-page="dashboard"]');
    expect(await dashboardLink.getText()).toBe('Tableau de bord');
  });
  
  test('dashboard page loads by default', async function() {
    // Attendre que le contenu soit chargé
    await app.client.waitUntilWindowLoaded();
    
    // Vérifier que le titre du tableau de bord est présent
    const dashboardTitle = await app.client.$('.page.active h1.h2');
    expect(await dashboardTitle.getText()).toBe('Tableau de bord');
    
    // Vérifier que les éléments du tableau de bord sont présents
    const currentBalance = await app.client.$('#current-balance');
    expect(await currentBalance.isExisting()).toBe(true);
    
    const monthlyIncome = await app.client.$('#monthly-income');
    expect(await monthlyIncome.isExisting()).toBe(true);
    
    const monthlyExpenses = await app.client.$('#monthly-expenses');
    expect(await monthlyExpenses.isExisting()).toBe(true);
  });
  
  test('can navigate to transactions page', async function() {
    // Attendre que le contenu soit chargé
    await app.client.waitUntilWindowLoaded();
    
    // Cliquer sur le lien Transactions
    const transactionsLink = await app.client.$('.list-group-item[data-page="transactions"]');
    await transactionsLink.click();
    
    // Attendre que la page des transactions soit chargée
    await app.client.pause(500); // Attente pour l'animation
    
    // Vérifier que la page des transactions est affichée
    const transactionsTitle = await app.client.$('.page.active h1.h2');
    expect(await transactionsTitle.getText()).toBe('Transactions');
    
    // Vérifier que le formulaire d'ajout de transaction est présent
    const transactionForm = await app.client.$('#transaction-form');
    expect(await transactionForm.isExisting()).toBe(true);
    
    // Vérifier que la liste des transactions est présente
    const transactionsList = await app.client.$('#transactions-list');
    expect(await transactionsList.isExisting()).toBe(true);
  });
  
  test('can navigate to budgets page', async function() {
    // Attendre que le contenu soit chargé
    await app.client.waitUntilWindowLoaded();
    
    // Cliquer sur le lien Budgets
    const budgetsLink = await app.client.$('.list-group-item[data-page="budgets"]');
    await budgetsLink.click();
    
    // Attendre que la page des budgets soit chargée
    await app.client.pause(500); // Attente pour l'animation
    
    // Vérifier que la page des budgets est affichée
    const budgetsTitle = await app.client.$('.page.active h1.h2');
    expect(await budgetsTitle.getText()).toBe('Budgets');
    
    // Vérifier que le formulaire d'ajout de budget est présent
    const budgetForm = await app.client.$('#budget-form');
    expect(await budgetForm.isExisting()).toBe(true);
    
    // Vérifier que la liste des budgets est présente
    const budgetsList = await app.client.$('#budgets-list');
    expect(await budgetsList.isExisting()).toBe(true);
  });
  
  test('can add a transaction', async function() {
    // Attendre que le contenu soit chargé
    await app.client.waitUntilWindowLoaded();
    
    // Naviguer vers la page des transactions
    const transactionsLink = await app.client.$('.list-group-item[data-page="transactions"]');
    await transactionsLink.click();
    await app.client.pause(500);
    
    // Remplir le formulaire
    await app.client.$('#transaction-type').selectByVisibleText('Revenu');
    await app.client.$('#transaction-category').selectByVisibleText('Salaire');
    await app.client.$('#transaction-amount').setValue('1500');
    await app.client.$('#transaction-description').setValue('Salaire mensuel');
    
    // Soumettre le formulaire
    await app.client.$('#transaction-form').submit();
    await app.client.pause(500);
    
    // Vérifier qu'une alerte de succès s'affiche
    const alert = await app.client.$('.alert-success');
    expect(await alert.isExisting()).toBe(true);
    expect(await alert.getText()).toContain('Transaction ajoutée avec succès');
  });
});
