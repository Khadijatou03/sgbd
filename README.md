# Plateforme de Gestion et Correction d'Exercices SGBD

Une plateforme web moderne pour la gestion et la correction automatique d'exercices de bases de données, intégrant l'intelligence artificielle.

## Fonctionnalités

- Gestion des utilisateurs (professeurs et étudiants)
- Authentification OAuth2 (Google, Microsoft, GitHub)
- Dépôt et gestion d'exercices
- Soumission de solutions en PDF
- Correction automatique par IA (DeepSeek via Ollama)
- Tableaux de bord interactifs
- Détection de plagiat
- Stockage cloud sécurisé

## Prérequis

- Node.js (v18 ou supérieur)
- MySQL (v8 ou supérieur)
- Ollama avec le modèle DeepSeek
- Compte AWS (pour S3) ou alternative (MinIO)

## Installation

1. Cloner le repository :
```bash
git clone [URL_DU_REPO]
cd ds-sgbd
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. Initialiser la base de données :
```bash
npm run db:init
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

## Structure du Projet

```
ds-sgbd/
├── src/
│   ├── config/         # Configurations
│   ├── controllers/    # Contrôleurs
│   ├── models/        # Modèles
│   ├── routes/        # Routes
│   ├── services/      # Services métier
│   ├── utils/         # Utilitaires
│   └── server.js      # Point d'entrée
├── tests/             # Tests
├── .env.example       # Template des variables d'environnement
├── package.json       # Dépendances
└── README.md         # Documentation
```

## Technologies Utilisées

- Backend : Node.js avec Express
- Base de données : MySQL
- Frontend : React.js avec Tailwind CSS
- IA : DeepSeek via Ollama
- Stockage : AWS S3/MinIO
- Authentification : Passport.js avec OAuth2
- Tests : Jest

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un pull request.

## Licence

MIT 