/**
 * PayUnit API Integration - Node.js Express Server
 * Documentation: https://developer.payunit.net/fr
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json()); // Middleware supplémentaire

// Configuration PayUnit depuis les variables d'environnement
const PAYUNIT_BASE_URL = process.env.PAYUNIT_BASE_URL || 'https://gateway.payunit.net';
const PAYUNIT_MODE = process.env.PAYUNIT_MODE || 'sandbox';
const PAYUNIT_API_USER = process.env.PAYUNIT_API_USER;
const PAYUNIT_API_PASSWORD = process.env.PAYUNIT_API_PASSWORD;
const PAYUNIT_API_KEY = process.env.PAYUNIT_API_KEY;

// Stockage en mémoire des transactions (en production, utiliser une vraie base de données)
const transactions = [];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Créer l'en-tête d'authentification Basic
 */
function createBasicAuth(apiUser, apiPassword) {
  const credentials = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Générer un ID de transaction unique
 */
function generateTransactionId() {
  return `PU${Date.now()}`;
}

/**
 * Trouver une transaction par ID
 */
function findTransaction(transactionId) {
  return transactions.find(tx => tx.transaction_id === transactionId);
}

/**
 * Valider les paramètres PayUnit
 */
function validatePayUnitCredentials(apiUser, apiPassword, apiKey) {
  if (!apiUser || !apiPassword || !apiKey) {
    return {
      valid: false,
      message: 'Credentials PayUnit manquants. Vérifiez vos variables d\'environnement ou paramètres.'
    };
  }
  return { valid: true };
}

// ==========================================
// API ROUTES - PAYUNIT INTEGRATION
// ==========================================

/**
 * POST /api/payment/initialize
 * Initialiser un paiement avec PayUnit
 */
app.post('/api/payment/initialize', async (req, res) => {
  try {
    const {
      total_amount,
      currency = 'XAF',
      payment_country = 'CM',
      customer_phone,
      payment_method
    } = req.body;

    // ✅ CORRECTION: Vérifier UNIQUEMENT le montant
    if (!total_amount) {
      return res.status(400).json({
        status: 'FAILED',
        error: 'Montant manquant',
        message: 'Le champ total_amount est obligatoire'
      });
    }

    // Validation des credentials
    const credentialsCheck = validatePayUnitCredentials(PAYUNIT_API_USER, PAYUNIT_API_PASSWORD, PAYUNIT_API_KEY);
    if (!credentialsCheck.valid) {
      return res.status(500).json({
        status: 'FAILED',
        error: 'Credentials PayUnit invalides',
        message: credentialsCheck.message
      });
    }

    // Valider le montant
    if (isNaN(total_amount) || parseInt(total_amount) <= 0) {
      return res.status(400).json({
        status: 'FAILED',
        error: 'Montant invalide',
        message: 'Le montant doit être un nombre positif'
      });
    }

    // Générer ID de transaction
    const transactionId = generateTransactionId();

    // Construire l'URL de base du serveur
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Préparer les données pour PayUnit
    const payunitData = {
      total_amount: parseInt(total_amount),
      currency,
      transaction_id: transactionId,
      return_url: `${baseUrl}/payment/return`,
      notify_url: `${baseUrl}/api/payment/notify`,
      payment_country,
      customer_phone,
      payment_method
    };

    console.log('📤 Initialisation paiement PayUnit:', {
      transaction_id: transactionId,
      amount: total_amount,
      currency,
      mode: PAYUNIT_MODE,
      payment_country
    });

    // Appeler l'API PayUnit
    const response = await axios.post(
      `${PAYUNIT_BASE_URL}/api/gateway/initialize`,
      payunitData,
      {
        headers: {
          'x-api-key': PAYUNIT_API_KEY,
          'mode': PAYUNIT_MODE,
          'Content-Type': 'application/json',
          'Authorization': createBasicAuth(PAYUNIT_API_USER, PAYUNIT_API_PASSWORD)
        },
        timeout: 10000
      }
    );

    // Sauvegarder la transaction en mémoire
    const transaction = {
      id: transactions.length + 1,
      transaction_id: transactionId,
      total_amount: parseInt(total_amount),
      currency,
      payment_country,
      status: 'PENDING',
      hosted_url: response.data.data?.transaction_url || null,
      providers: response.data.data?.providers || [],
      return_url: payunitData.return_url,
      notify_url: payunitData.notify_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    transactions.push(transaction);

    console.log('✅ Paiement initialisé avec succès:', transactionId);

    // Retourner la réponse
    res.json({
      status: 'SUCCESS',
      message: 'Paiement initialisé avec succès',
      data: response.data.data,
      transaction_id: transactionId
    });

  } catch (error) {
    console.error('❌ Erreur initialisation paiement:', error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    res.status(statusCode).json({
      status: 'FAILED',
      error: 'Échec de l\'initialisation du paiement',
      message: errorMessage,
      details: error.response?.data || null,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/payment/notify
 * Webhook pour recevoir les notifications de PayUnit
 */
app.post('/api/payment/notify', async (req, res) => {
  try {
    const notification = req.body;

    console.log('🔔 Notification PayUnit reçue:', JSON.stringify(notification, null, 2));

    // Extraire les données de la notification
    const {
      status,
      statusCode,
      message,
      data
    } = notification;

    if (data && data.transaction_id) {
      // Trouver la transaction
      const transaction = findTransaction(data.transaction_id);

      if (transaction) {
        // Mettre à jour le statut
        transaction.status = data.transaction_status || status || 'UNKNOWN';
        transaction.gateway = data.transaction_gateway || null;
        transaction.gateway_reference = data.gateway_reference || null;
        transaction.message = message || data.message || null;
        transaction.updated_at = new Date().toISOString();

        console.log(`✅ Transaction ${data.transaction_id} mise à jour: ${transaction.status}`);
      } else {
        console.warn(`⚠️  Transaction non trouvée: ${data.transaction_id}`);
      }
    }

    // Répondre à PayUnit avec succès
    res.json({
      status: 'SUCCESS',
      message: 'Notification reçue et traitée',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur traitement notification:', error.message);
    
    res.status(500).json({
      error: 'Échec du traitement de la notification',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/payment/status/:transaction_id
 * Vérifier le statut d'une transaction
 */
app.get('/api/payment/status/:transaction_id', (req, res) => {
  try {
    const { transaction_id } = req.params;
    
    if (!transaction_id) {
      return res.status(400).json({
        error: 'ID de transaction manquant',
        message: 'Le paramètre transaction_id est obligatoire'
      });
    }

    const transaction = findTransaction(transaction_id);

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction non trouvée',
        transaction_id,
        message: `Aucune transaction trouvée avec l'ID: ${transaction_id}`
      });
    }

    res.json({
      status: 'SUCCESS',
      data: transaction
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut:', error.message);
    
    res.status(500).json({
      error: 'Échec de la vérification du statut',
      message: error.message
    });
  }
});

/**
 * GET /api/transactions
 * Récupérer toutes les transactions
 */
app.get('/api/transactions', (req, res) => {
  try {
    // Trier par date (plus récent en premier)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      status: 'SUCCESS',
      total: transactions.length,
      transactions: sortedTransactions
    });

  } catch (error) {
    console.error('❌ Erreur récupération transactions:', error.message);
    
    res.status(500).json({
      error: 'Échec de la récupération des transactions',
      message: error.message
    });
  }
});

/**
 * DELETE /api/transactions
 * Supprimer toutes les transactions (pour les tests)
 */
app.delete('/api/transactions', (req, res) => {
  const count = transactions.length;
  transactions.length = 0;
  
  console.log(`🗑️  ${count} transaction(s) supprimée(s)`);
  
  res.json({
    status: 'SUCCESS',
    message: `${count} transaction(s) supprimée(s)`,
    remaining: transactions.length
  });
});

// ==========================================
// FRONTEND ROUTES
// ==========================================

/**
 * GET /
 * Page d'accueil
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * GET /payment/return
 * Page de retour après paiement
 */
app.get('/payment/return', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'return.html'));
});

// ==========================================
// HEALTH CHECK
// ==========================================

/**
 * GET /health
 * Vérifier que le serveur fonctionne
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Serveur PayUnit API en bonne santé',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    transactions_count: transactions.length,
    environment: process.env.NODE_ENV || 'development',
    payunit_mode: PAYUNIT_MODE
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    message: 'Vérifiez que l\'URL et la méthode HTTP sont correctes'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    error: 'Erreur serveur',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('   PayUnit API - Serveur Node.js Express');
  console.log('   ============================================');
  console.log(`   📡 Serveur démarré sur le port ${PORT}`);
  console.log(`   🌍 URL: http://localhost:${PORT}`);
  console.log(`   📚 Documentation: https://developer.payunit.net/fr`);
  console.log(`   🔧 Mode: ${PAYUNIT_MODE}`);
  console.log('   ============================================');
  console.log('');
  console.log('   Endpoints disponibles:');
  console.log('   - POST   /api/payment/initialize');
  console.log('   - POST   /api/payment/notify');
  console.log('   - GET    /api/payment/status/:id');
  console.log('   - GET    /api/transactions');
  console.log('   - DELETE /api/transactions');
  console.log('   - GET    /health');
  console.log('');
  console.log('   Credentials PayUnit:');
  console.log(`   - API User: ${PAYUNIT_API_USER ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log(`   - API Password: ${PAYUNIT_API_PASSWORD ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log(`   - API Key: ${PAYUNIT_API_KEY ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log('');
  console.log('   Ctrl+C pour arrêter le serveur');
  console.log('============================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;
