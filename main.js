const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const Datastore = require('nedb');

// Configuration de la base de données
const db = {
  transactions: new Datastore({ filename: path.join(app.getPath('userData'), 'transactions.db'), autoload: true }),
  budgets: new Datastore({ filename: path.join(app.getPath('userData'), 'budgets.db'), autoload: true }),
  goals: new Datastore({ filename: path.join(app.getPath('userData'), 'goals.db'), autoload: true }),
  settings: new Store({ name: 'settings' })
};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icons', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Ouvrir les outils de développement en mode développement
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Menu de l'application
  const template = [
    {
      label: 'Fichier',
      submenu: [
        { role: 'quit', label: 'Quitter' }
      ]
    },
    {
      label: 'Vue',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            // Afficher les informations sur l'application
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              resizable: false,
              parent: mainWindow,
              modal: true,
              webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
              }
            });
            aboutWindow.loadFile('about.html');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Créer la fenêtre lorsque l'application est prête
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter l'application lorsque toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gestionnaires d'IPC pour les transactions
ipcMain.handle('get-transactions', async (event, filter) => {
  return new Promise((resolve, reject) => {
    db.transactions.find(filter || {}).sort({ date: -1 }).exec((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('add-transaction', async (event, transaction) => {
  return new Promise((resolve, reject) => {
    db.transactions.insert(transaction, (err, newDoc) => {
      if (err) reject(err);
      else resolve(newDoc);
    });
  });
});

ipcMain.handle('update-transaction', async (event, id, transaction) => {
  return new Promise((resolve, reject) => {
    db.transactions.update({ _id: id }, { $set: transaction }, {}, (err, numReplaced) => {
      if (err) reject(err);
      else resolve(numReplaced);
    });
  });
});

ipcMain.handle('delete-transaction', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.transactions.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});

// Gestionnaires d'IPC pour les budgets
ipcMain.handle('get-budgets', async () => {
  return new Promise((resolve, reject) => {
    db.budgets.find({}).exec((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('add-budget', async (event, budget) => {
  return new Promise((resolve, reject) => {
    db.budgets.insert(budget, (err, newDoc) => {
      if (err) reject(err);
      else resolve(newDoc);
    });
  });
});

ipcMain.handle('update-budget', async (event, id, budget) => {
  return new Promise((resolve, reject) => {
    db.budgets.update({ _id: id }, { $set: budget }, {}, (err, numReplaced) => {
      if (err) reject(err);
      else resolve(numReplaced);
    });
  });
});

ipcMain.handle('delete-budget', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.budgets.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});

// Gestionnaires d'IPC pour les objectifs d'épargne
ipcMain.handle('get-goals', async () => {
  return new Promise((resolve, reject) => {
    db.goals.find({}).exec((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('add-goal', async (event, goal) => {
  return new Promise((resolve, reject) => {
    db.goals.insert(goal, (err, newDoc) => {
      if (err) reject(err);
      else resolve(newDoc);
    });
  });
});

ipcMain.handle('update-goal', async (event, id, goal) => {
  return new Promise((resolve, reject) => {
    db.goals.update({ _id: id }, { $set: goal }, {}, (err, numReplaced) => {
      if (err) reject(err);
      else resolve(numReplaced);
    });
  });
});

ipcMain.handle('delete-goal', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.goals.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});

// Gestionnaires d'IPC pour les paramètres
ipcMain.handle('get-settings', async () => {
  return db.settings.store;
});

ipcMain.handle('update-settings', async (event, settings) => {
  Object.keys(settings).forEach(key => {
    db.settings.set(key, settings[key]);
  });
  return db.settings.store;
});

// Réinitialisation des données (pour les tests)
ipcMain.handle('reset-data', async () => {
  return new Promise((resolve, reject) => {
    try {
      db.transactions.remove({}, { multi: true });
      db.budgets.remove({}, { multi: true });
      db.goals.remove({}, { multi: true });
      db.settings.clear();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
});