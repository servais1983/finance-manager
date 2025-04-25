# Finance Manager

Application de gestion financière personnelle pour Windows 11.

## Description

Finance Manager est une application de bureau permettant de gérer vos finances personnelles, d'établir des budgets et de suivre vos objectifs d'épargne. L'application offre une interface intuitive et conviviale, ainsi que des fonctionnalités complètes pour vous aider à prendre le contrôle de vos finances.

## Fonctionnalités

- **Tableau de bord** : Vue d'ensemble de votre situation financière actuelle
- **Gestion des transactions** : Suivi de vos revenus et dépenses
- **Budgets** : Création et suivi de budgets par catégorie
- **Objectifs d'épargne** : Définition et suivi de vos objectifs financiers
- **Rapports** : Analyse détaillée de vos finances avec graphiques
- **Personnalisation** : Plusieurs thèmes et options de personnalisation

## Installation

### Prérequis

- Node.js 18.0.0 ou supérieur
- npm 9.0.0 ou supérieur
- Windows 11 (fonctionne également sur Windows 10 et macOS)

### Étapes d'installation

1. Cloner le dépôt
   ```bash
   git clone https://github.com/servais1983/finance-manager.git
   cd finance-manager
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Démarrer l'application en mode développement
   ```bash
   npm start
   ```

4. Construire l'application pour production
   ```bash
   npm run build
   ```

## Structure du projet

```
finance-manager/
├── assets/          # Ressources statiques (icônes, images)
├── css/             # Feuilles de style CSS
├── js/              # Scripts JavaScript
│   ├── pages/       # Scripts spécifiques aux pages
│   ├── app.js       # Point d'entrée de l'application
│   └── router.js    # Gestion de la navigation
├── pages/           # Templates HTML des différentes pages
├── main.js          # Point d'entrée principal d'Electron
├── preload.js       # Script de préchargement d'Electron
├── index.html       # Page principale
├── package.json     # Configuration du projet et dépendances
└── README.md        # Documentation
```

## Développement

### Technologies utilisées

- [Electron](https://www.electronjs.org/) - Framework pour applications de bureau
- [Bootstrap](https://getbootstrap.com/) - Framework CSS
- [Chart.js](https://www.chartjs.org/) - Bibliothèque de graphiques
- [NeDB](https://github.com/louischatriot/nedb) - Base de données NoSQL embarquée

### Commandes npm

- `npm start` - Démarre l'application en mode développement
- `npm run build` - Construit l'application pour production
- `npm test` - Exécute les tests

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.