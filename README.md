# 🚀 PayUnit API - Node.js Express Integration

Intégration simple et rapide de l'API PayUnit avec Node.js et Express.

## 📋 Description

Cette application permet d'intégrer facilement l'API de paiement **PayUnit** dans vos projets Node.js. Elle fournit une API REST complète et une interface web moderne pour gérer les paiements mobile money en Afrique.

## ✨ Fonctionnalités

- ✅ **Initialisation de paiements** via l'API PayUnit
- ✅ **Réception de webhooks** pour les notifications
- ✅ **Suivi des transactions** en temps réel
- ✅ **Interface web moderne** avec TailwindCSS
- ✅ **API REST complète** avec Express
- ✅ **Support multi-devises** (XAF, XOF)
- ✅ **Support multi-pays** (Cameroun, Sénégal, Côte d'Ivoire)
- ✅ **Modes Sandbox et Live**

## 🛠️ Technologies

- **Backend** : Node.js + Express
- **HTTP Client** : Axios
- **Frontend** : HTML + TailwindCSS
- **Process Manager** : PM2

## 📦 Installation

### 1. Cloner le projet
```bash
cd /home/user/payunit-nodejs
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration (Optionnel)
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos identifiants (optionnel - vous pouvez les saisir dans l'interface)
nano .env
```

## 🚀 Démarrage

### Méthode 1 : Direct avec Node.js
```bash
npm start
```

### Méthode 2 : Avec PM2 (Recommandé)
```bash
# Démarrer
pm2 start ecosystem.config.js

# Voir le statut
pm2 status

# Voir les logs
pm2 logs payunit-api

# Redémarrer
pm2 restart payunit-api

# Arrêter
pm2 stop payunit-api
```

L'application sera accessible sur : **http://localhost:3000**

## 📡 API Endpoints

### Paiements

#### 1. Initialiser un paiement
```http
POST /api/payment/initialize
Content-Type: application/json

{
  "total_amount": 10000,
  "currency": "XAF",
  "payment_country": "CM",
  "api_user": "votre_api_user",
  "api_password": "votre_api_password",
  "api_key": "sandbox_xxx",
  "mode": "sandbox"
}
```

**Réponse :**
```json
{
  "status": "SUCCESS",
  "statusCode": 200,
  "message": "Transaction created!",
  "data": {
    "transaction_id": "PU1234567890",
    "transaction_url": "https://...",
    "providers": [...]
  }
}
```

#### 2. Webhook de notification
```http
POST /api/payment/notify
Content-Type: application/json

{
  "status": "SUCCESS",
  "data": {
    "transaction_id": "PU1234567890",
    "transaction_status": "SUCCESS",
    "transaction_amount": 10000,
    "transaction_gateway": "CM_ORANGE"
  }
}
```

#### 3. Vérifier le statut
```http
GET /api/payment/status/:transaction_id
```

#### 4. Liste des transactions
```http
GET /api/transactions
```

#### 5. Supprimer toutes les transactions
```http
DELETE /api/transactions
```

### Autres

#### Health Check
```http
GET /health
```

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2026-01-08T22:00:00.000Z",
  "uptime": 123.45,
  "transactions_count": 5
}
```

## 🎯 Utilisation

### 1. Créer un compte PayUnit

Aller sur : https://pu.payunit.net/dashboard/register

### 2. Créer une application

- Se connecter au Dashboard
- Cliquer sur "Créer une application"
- Choisir le type **PAYMENT COLLECTION**
- Activer l'application

### 3. Récupérer les identifiants

**Dans Paramètres utilisateur > API CREDENTIALS :**
- API User
- API Password

**Dans Paramètres de l'application > APPLICATION DETAIL :**
- API Key (sandbox et/ou live)

### 4. Utiliser l'application

1. Ouvrir : http://localhost:3000
2. Remplir le formulaire avec vos identifiants
3. Entrer le montant du paiement
4. Cliquer sur "Initier le Paiement"
5. Suivre le lien PayUnit pour effectuer le paiement
6. La transaction sera mise à jour automatiquement

## 📂 Structure du Projet

```
payunit-nodejs/
├── server.js              # Serveur Express principal (300+ lignes)
├── public/
│   ├── index.html         # Interface web principale
│   └── return.html        # Page de retour
├── logs/                  # Logs PM2 (auto-créé)
├── ecosystem.config.js    # Configuration PM2
├── package.json           # Dépendances
├── .env.example           # Variables d'environnement exemple
└── README.md              # Cette documentation
```

## 🧪 Tests

### Test rapide
```bash
# Vérifier que le serveur fonctionne
curl http://localhost:3000/health

# Lister les transactions
curl http://localhost:3000/api/transactions
```

### Test complet
```bash
# Initialiser un paiement (remplacer les valeurs)
curl -X POST http://localhost:3000/api/payment/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "total_amount": 1000,
    "currency": "XAF",
    "payment_country": "CM",
    "api_user": "YOUR_USER",
    "api_password": "YOUR_PASSWORD",
    "api_key": "sandbox_xxx",
    "mode": "sandbox"
  }'
```

## 📊 Stockage des Données

**Important** : Cette version utilise un stockage **en mémoire** (tableau JavaScript).

Les transactions sont perdues au redémarrage du serveur.

### Pour la production, intégrer une vraie base de données :

#### Option 1 : SQLite
```bash
npm install sqlite3
```

#### Option 2 : MongoDB
```bash
npm install mongodb mongoose
```

#### Option 3 : PostgreSQL
```bash
npm install pg
```

## 🔐 Sécurité

- ✅ CORS activé
- ✅ Body parser sécurisé
- ✅ Validation des entrées
- ✅ Gestion des erreurs
- ⚠️ Ajouter un système d'authentification en production
- ⚠️ Ne jamais exposer vos identifiants API dans le code

## 📚 Documentation

- **PayUnit API** : https://developer.payunit.net/fr
- **Dashboard** : https://pu.payunit.net/dashboard/login
- **Inscription** : https://pu.payunit.net/dashboard/register

## 🤝 Méthodes de Paiement

PayUnit supporte plusieurs opérateurs :

- 🟠 **Orange Money** (Cameroun, Sénégal, Côte d'Ivoire)
- 🟡 **MTN Mobile Money** (Cameroun, Côte d'Ivoire)
- 🔵 **Express Union** (Cameroun)
- 🟢 **Wave** (Sénégal, Côte d'Ivoire)
- Et plus encore...

## 🚧 Améliorations Futures

- [ ] Base de données persistante (SQLite, MongoDB, PostgreSQL)
- [ ] Authentification utilisateur
- [ ] Dashboard administrateur
- [ ] Export de données (CSV, PDF)
- [ ] Notifications email
- [ ] Tests automatisés
- [ ] Gestion des remboursements
- [ ] Logs avancés

## 🐛 Débogage

### Logs du serveur
```bash
# Avec PM2
pm2 logs payunit-api

# Sans PM2
npm start  # Les logs s'afficheront dans le terminal
```

### Problèmes courants

**Port 3000 déjà utilisé ?**
```bash
# Tuer le processus
fuser -k 3000/tcp

# Ou changer le port dans .env
PORT=3001
```

**Erreur "Missing required fields" ?**
- Vérifier que tous les champs sont remplis
- Vérifier que vos identifiants API sont corrects

**Webhook ne fonctionne pas ?**
- En local, utiliser un service comme ngrok ou webhook.site
- Vérifier que l'URL de notification est accessible publiquement

## 📝 Licence

ISC

## 👨‍💻 Auteur

Développé avec ❤️ pour l'intégration de PayUnit

## 📞 Support

- **Documentation** : https://developer.payunit.net/fr
- **Support PayUnit** : https://payunit.net/#contact

---

**Prêt à accepter des paiements mobile money en Afrique ! 🌍💰**
