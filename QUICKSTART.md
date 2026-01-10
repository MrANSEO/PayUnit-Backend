# 🚀 Démarrage Rapide - PayUnit Node.js

## ⚡ Installation en 3 étapes

### 1️⃣ Installer les dépendances
```bash
cd /home/user/payunit-nodejs
npm install
```

### 2️⃣ Démarrer le serveur
```bash
# Avec PM2 (recommandé)
pm2 start ecosystem.config.js

# Ou directement avec Node.js
npm start
```

### 3️⃣ Ouvrir dans le navigateur
```
http://localhost:3000
```

**URL Publique** : https://3000-iaylpuscntyxyk3j17yao-5c13a017.sandbox.novita.ai

---

## 📝 Configuration PayUnit

### Obtenir vos identifiants

1. **Créer un compte** : https://pu.payunit.net/dashboard/register
2. **Créer une application** de type "PAYMENT COLLECTION"
3. **Récupérer** :
   - API User (dans Paramètres > API CREDENTIALS)
   - API Password (dans Paramètres > API CREDENTIALS)
   - API Key (dans Paramètres application > APPLICATION DETAIL)

### Utiliser dans l'interface

1. Ouvrir http://localhost:3000
2. Remplir le formulaire avec vos identifiants
3. Entrer un montant (ex: 1000 XAF)
4. Cliquer sur "Initier le Paiement"
5. Suivre le lien PayUnit

---

## 🧪 Tests API

### Health Check
```bash
curl http://localhost:3000/health
```

### Liste des transactions
```bash
curl http://localhost:3000/api/transactions
```

### Initialiser un paiement
```bash
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

---

## 🛠️ Commandes PM2

```bash
pm2 status              # Voir le statut
pm2 logs payunit-api    # Voir les logs en direct
pm2 restart payunit-api # Redémarrer
pm2 stop payunit-api    # Arrêter
pm2 delete payunit-api  # Supprimer
```

---

## 📡 Endpoints Disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Interface web |
| POST | `/api/payment/initialize` | Initialiser un paiement |
| POST | `/api/payment/notify` | Webhook PayUnit |
| GET | `/api/payment/status/:id` | Vérifier le statut |
| GET | `/api/transactions` | Liste des transactions |
| DELETE | `/api/transactions` | Effacer les transactions |
| GET | `/health` | Santé du serveur |

---

## 📂 Structure

```
payunit-nodejs/
├── server.js              # Serveur Express (300+ lignes)
├── public/
│   ├── index.html         # Interface web
│   └── return.html        # Page de retour
├── logs/                  # Logs PM2
├── ecosystem.config.js    # Config PM2
├── package.json           # Dépendances
└── README.md              # Documentation complète
```

---

## 🎯 Fonctionnalités

✅ **Backend Node.js Express**  
✅ **API REST complète**  
✅ **Interface web moderne**  
✅ **Stockage en mémoire**  
✅ **Webhooks PayUnit**  
✅ **Multi-devises (XAF, XOF)**  
✅ **Multi-pays (CM, SN, CI)**  
✅ **Modes Sandbox & Live**  

---

## 📚 Documentation

- **README.md** : Documentation complète
- **PayUnit Docs** : https://developer.payunit.net/fr
- **Dashboard** : https://pu.payunit.net/dashboard/login

---

## 💡 Astuce Production

Pour la production, remplacer le stockage en mémoire par une vraie base de données :

```bash
# SQLite
npm install sqlite3

# MongoDB
npm install mongodb mongoose

# PostgreSQL
npm install pg
```

---

**Prêt à accepter des paiements ! 🎉**
