import 'dotenv/config'; // Charge les variables du fichier .env pour les modules ES
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer'; // Middleware pour la gestion des téléchargements de fichiers
import csvParser from 'csv-parser'; // Bibliothèque pour l'analyse des données CSV
import { Readable } from 'stream'; // Utilitaire de flux Node.js
import * as XLSX from 'xlsx'; // Nouvelle bibliothèque pour lire les fichiers Excel
import cors from 'cors'; // Importation du module CORS
import fetch from 'node-fetch'; // Pour faire des requêtes HTTP vers l'API Pennylane

const app = express();
const port = process.env.PORT || 3001; // Le backend écoutera sur le port 3001 ou la variable d'environnement PORT

// --- Initialisation du client Supabase ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Vérification de base des identifiants Supabase
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR : Les variables d'environnement Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) ne sont pas définies.");
  console.error("Veuillez vous assurer que votre fichier .env est correctement configuré à la racine du projet.");
  process.exit(1); // Quitte le processus si les identifiants sont manquants
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration de Multer pour la gestion des téléchargements de fichiers (stockage en mémoire pour le CSV/Excel)
const upload = multer({ storage: multer.memoryStorage() });

// --- Mappage définitif Pennylane vers KPI pour SPG DU RAIL ---
// Cet objet mappe les noms exacts des comptes Pennylane à vos catégories KPI standardisées.
const pennylaneToKPIMapping = {
    // I. PRODUITS D'EXPLOITATION
    "Ventes": "Net Revenue - Restaurant Sales", // Chiffre d'affaires net
    "Production stockée": "Operating Revenues - Production Stocked", // Manuel
    "Production immobilisée": "Operating Revenues - Capitalized Production", // Manuel
    "Aides / Subventions": "Operating Revenues - Subsidies", // Subventions d'exploitation
    "Apport en Compte Courant Associé": "Operating Revenues - Other", // Autres produits d'exploitation
    "Virement externe": "Operating Revenues - Other", // Autres produits d'exploitation
    "Autres produits d'exploitation": "Operating Revenues - Other", // Manuel, pour des ajouts non mappés

    // II. CHARGES D'EXPLOITATION
    "Fournisseurs Alimentaires": "Cost of Goods Sold - Purchases of Goods", // Achats de marchandises
    "Variation de stock de marchandises": "Cost of Goods Sold - Stock Variation Goods", // Manuel
    "Fournisseurs Matériel & Équipements": "Cost of Goods Sold - Purchases of Raw Materials", // Achats de matières premières
    "Variation de stock de matières premières": "Cost of Goods Sold - Stock Variation Raw Materials", // Manuel

    // Autres achats et charges externes (regroupe plusieurs Pennylane accounts et un manuel)
    "Loyers": "Operating Expenses - Other External Purchases & Expenses",
    "Assurance": "Operating Expenses - Other External Purchases & Expenses",
    "Finance & Compta": "Operating Expenses - Other External Purchases & Expenses",
    "Frais bancaires": "Operating Expenses - Other External Purchases & Expenses",
    "Déplacements": "Operating Expenses - Other External Purchases & Expenses",
    "Logiciels & Services Web": "Operating Expenses - Other External Purchases & Expenses",
    "Téléphone & Internet": "Operating Expenses - Other External Purchases & Expenses",
    "Restauration": "Operating Expenses - Other External Purchases & Expenses",
    "Sous-traitance & Prestations": "Operating Expenses - Other External Purchases & Expenses",
    "Sacem": "Operating Expenses - Other External Purchases & Expenses",
    "SPG": "Operating Expenses - Other External Purchases & Expenses",
    "Prefloc (Loyer TPE)": "Operating Expenses - Other External Purchases & Expenses",
    "Frais de Gestion (Recettes)": "Operating Expenses - Other External Purchases & Expenses",
    "Autres achats et charges externes": "Operating Expenses - Other External Purchases & Expenses", // Manuel, pour des ajouts non mappés
    
    // Impôts et taxes (regroupe plusieurs Pennylane accounts)
    "Impôts": "Operating Expenses - Taxes and Duties",
    "CFE (13/12)": "Operating Expenses - Taxes and Duties",
    "TVA (20%)": "Operating Expenses - Taxes and Duties",
    "Taxe de séjour": "Operating Expenses - Taxes and Duties",

    // Charges de personnel (regroupe plusieurs Pennylane accounts)
    "Salaires": "Personnel Costs",
    "Cotisations Comp. Retraites": "Personnel Costs",
    "Mutuelle & Prévoyance": "Personnel Costs",
    "URSSAF - DSN": "Personnel Costs",
    "URSSAF - TNS Guillaume HEREAULT": "Personnel Costs",
    "URSSAF TNS - Pascal OURDAN": "Personnel Costs",
    "AGS (Env. 1726€/employé)": "Personnel Costs",

    "Dotations aux amortissements et provisions": "Operating Expenses - Depreciation and Provisions", // Manuel
    "Autres charges d'exploitation": "Operating Expenses - Other", // Manuel

    // IV. PRODUITS FINANCIERS
    "Produits des participations": "Financial Revenues - Participations", // Manuel
    "Autres produits financiers": "Financial Revenues - Other", // Manuel

    // V. CHARGES FINANCIÈRES
    "Frais d'Emprunt": "Financial Expenses - Interest Expenses", // Charges d'intérêts
    "Intérêts d'Emprunt": "Financial Expenses - Interest Expenses", // Charges d'intérêts
    "Autres charges financières": "Financial Expenses - Other", // Manuel

    // VIII. PRODUITS EXCEPTIONNELS
    "Produits sur opérations de gestion": "Exceptional Revenues - Management Operations", // Manuel
    "Produits sur opérations en capital": "Exceptional Revenues - Capital Operations", // Manuel

    // IX. CHARGES EXCEPTIONNELLES
    "Charges sur opérations de gestion": "Exceptional Expenses - Management Operations", // Manuel
    "Charges sur opérations en capital": "Exceptional Expenses - Capital Operations", // Manuel

    // XI. PARTICIPATION DES SALARIÉS
    "Participation des salariés": "Other P&L - Employee Profit Sharing", // Manuel

    // XII. IMPÔTS SUR LES BÉNÉFICES
    "Impôts sur les bénéfices": "Other P&L - Income Tax", // Manuel

    // Éléments non-opérationnels/spécifiques (doivent être stockés mais généralement exclus des calculs de KPI du compte de résultat)
    "Emprunts": "Non-Operating/Specific Items (Not for core P&L)",
    "Remboursement en CC Associé": "Non-Operating/Specific Items (Not for core P&L)",
    "Remboursement Prêt": "Non-Operating/Specific Items (Not for core P&L)",
    "TVA à Décaisser": "Non-Operating/Specific Items (Not for core P&L)",
    "Virement interne": "Non-Operating/Specific Items (Not for core P&L)"
};

// Fonction d'aide pour mapper un compte Pennylane à une catégorie KPI
function getKPICategory(pennylaneAccount) {
    // Utilise le mappage direct. Si non trouvé, utilise une valeur par défaut.
    return pennylaneToKPIMapping[pennylaneAccount] || "Uncategorized Financial Item";
}

// Fonction pour parser la date à partir d'un numéro de série Excel ou d'une chaîne de caractères
function parseExcelDate(dateValue) {
  if (typeof dateValue === 'number') {
    // C'est un numéro de série Excel (jours depuis 1900-01-01)
    const dateObj = XLSX.SSF.parse_date_code(dateValue);
    // Le mois est indexé à partir de 0 dans Date JavaScript, donc soustraire 1
    const date = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } else if (typeof dateValue === 'string') {
    // Essaye d'analyser les dates sous forme de chaîne (JJ/MM/AAAA, AAAA-MM-JJ, etc.)
    // Priorise JJ/MM/AAAA
    let parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mois est 0-indexé
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date.toISOString().split('T')[0];
      }
    }
    // Essaye d'autres formats si JJ/MM/AAAA échoue
    let date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return null; // Retourne null si la date ne peut pas être analysée
}


// Fonction pour insérer/mettre à jour les données financières dans Supabase
async function upsertFinancialData(data) {
  try {
    // Valide et transforme les données avant l'insertion
    const validatedData = data.map(item => {
      // Nettoyage et conversion du montant
      const amountString = String(item.amount || item.Montant).replace(',', '.').replace('€', '').trim();
      const amount = parseFloat(amountString);

      // Conversion de la date avec la nouvelle fonction parseExcelDate
      const dateIso = parseExcelDate(item.date || item.Date);
      
      // Utilise 'Types de dépenses/revenus' pour les fichiers CSV/Excel, ou 'original_pennylane_account' pour les données Pennylane
      const accountName = item.original_pennylane_account || item['Types de dépenses / revenus']; // Corrected column name

      // Validation des champs critiques
      if (!dateIso || !accountName || isNaN(amount)) {
        console.warn(`Ligne ignorée en raison de données requises manquantes, mal nommées ou invalides: Date='${item.date || item.Date}', Montant='${item.amount || item.Montant}', Types de dépenses/revenus='${accountName}', Montant converti=${amount}, Date convertie=${dateIso}. Ligne complète:`, item);
        return null; // Retourne null pour les lignes invalides
      }

      return {
        date: dateIso,
        original_pennylane_account: accountName,
        category_mapped_to_kpi: getKPICategory(accountName),
        amount: amount,
        restaurant_id: item.restaurant_id || 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Use provided ID or default
      };
    }).filter(item => item !== null); // Filtre les lignes nulles (invalides)

    if (validatedData.length === 0) {
        throw new Error('Aucune donnée valide trouvée dans le fichier pour l\'insertion.');
    }

    // Using upsert to insert new records or update existing ones based on unique constraint
    // Assuming (date, original_pennylane_account, restaurant_id) is a unique constraint in your Supabase table
    const { data: upsertedData, error } = await supabase
      .from('financial_data')
      .upsert(validatedData, { onConflict: 'date,original_pennylane_account,restaurant_id' }); // Specify your unique constraint columns

    if (error) {
      console.error('Erreur lors de l\'insertion des données financières :', error);
      throw error;
    }
    console.log('Données financières insérées avec succès :', upsertedData);
    return upsertedData;
  } catch (error) {
    console.error("Erreur lors de l'insertion des données :", error);
    throw error;
  }
}

// Middleware CORS pour permettre les requêtes depuis le frontend
app.use(cors()); // Permet toutes les origines pour le développement

// Middleware pour analyser les corps de requête JSON (pour d'autres appels API potentiels)
app.use(express.json());

// --- API Endpoint to Upload CSV/Excel File ---
app.post('/api/upload-csv', upload.single('file'), async (req, res) => { // 'file' est le nom du champ de fichier
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let parsedData = [];

    try {
        if (fileExtension === 'csv') {
            const stream = Readable.from(req.file.buffer);
            parsedData = await new Promise((resolve, reject) => {
                const results = [];
                stream.pipe(csvParser())
                    .on('data', (row) => results.push(row))
                    .on('end', () => resolve(results))
                    .on('error', reject);
            });
        } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0]; // Prend la première feuille par défaut
            const worksheet = workbook.Sheets[sheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet, { raw: false, header: 2 }); // raw: false pour tenter de formater les dates/nombres, header: 2 pour lire la DEUXIÈME ligne comme en-têtes
        } else {
            return res.status(400).json({ error: 'Format de fichier non pris en charge. Veuillez télécharger un fichier CSV, XLS ou XLSX.' });
        }

        // Les données sont maintenant validées et mappées dans upsertFinancialData
        await upsertFinancialData(parsedData);
        res.json({ message: 'Fichier téléchargé et traité avec succès !' });

    } catch (error) {
        console.error('Erreur lors du traitement du fichier :', error);
        res.status(500).json({ error: 'Échec du traitement du fichier : ' + error.message });
    }
});

// --- API Endpoint to Update Financial Data (for manual edits) ---
app.put('/api/financialData', async (req, res) => {
    const dataToUpdate = req.body; // S'attend à un tableau d'objets comme [{ date, original_pennylane_account, amount }]

    if (!Array.isArray(dataToUpdate) || dataToUpdate.length === 0) {
        return res.status(400).json({ error: 'Format de données invalide. Un tableau d\'objets de données financières était attendu.' });
    }

    try {
        await upsertFinancialData(dataToUpdate);
        res.json({ message: 'Données financières mises à jour avec succès !' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données financières :', error);
        res.status(500).json({ error: 'Échec de la mise à jour des données financières : ' + error.message });
    }
});


// --- API Endpoint to Fetch Financial Data ---
app.get('/api/financialData', async (req, res) => {
    try {
        const { restaurantId } = req.query; // Get restaurantId from query parameters

        let query = supabase.from('financial_data').select('*');

        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erreur lors de la récupération des données financières depuis Supabase :", error);
            res.status(500).json({ error: 'Échec de la récupération des données financières' });
        } else {
            res.json(data);
        }
    }
    catch (error) {
        console.error("Erreur inattendue dans /api/financialData :", error);
        res.status(500).json({ error: 'Une erreur inattendue est survenue' });
    }
});

// --- NEW API Endpoint to Sync with Pennylane ---
app.post('/api/sync-pennylane', async (req, res) => {
    const { apiKey, restaurantId } = req.body; // Expect restaurantId here

    if (!apiKey) {
        return res.status(400).json({ error: 'Clé API Pennylane manquante.' });
    }
    if (!restaurantId) {
        return res.status(400).json({ error: 'ID du restaurant manquant pour la synchronisation Pennylane.' });
    }

    // Placeholder for Pennylane API base URL (replace with actual Pennylane API URL)
    const PENNYLANE_API_BASE_URL = 'https://api.pennylane.com/v2'; // This is an example, replace with actual Pennylane API URL

    try {
        // --- Step 1: Fetch data from Pennylane ---
        // This is a simplified example. You'll need to consult Pennylane API docs
        // for actual endpoints and data structures for revenue, purchases, etc.

        // Example: Fetching general ledger or transactions
        // You'll likely need to iterate over months or use date ranges
        const pennylaneResponse = await fetch(`${PENNYLANE_API_BASE_URL}/general_ledger`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            // Add query parameters for date range (Jan-Jun) and filtering if needed
            // e.g., ?start_date=2024-01-01&end_date=2024-06-30
        });

        if (!pennylaneResponse.ok) {
            const errorText = await pennylaneResponse.text();
            throw new Error(`Erreur de l'API Pennylane: ${pennylaneResponse.status} - ${errorText}`);
        }

        const pennylaneData = await pennylaneResponse.json();
        console.log("Données brutes de Pennylane:", pennylaneData);

        // --- Step 2: Transform Pennylane data to match your Supabase schema ---
        // This is where you'll map Pennylane's specific fields and account names
        // to your `original_pennylane_account` and `amount`
        const transformedData = [];
        // For demonstration, let's simulate some data based on your requirements
        // In a real scenario, you would parse `pennylaneData` here.
        const months = ['01', '02', '03', '04', '05', '06'];
        const currentYear = new Date().getFullYear();

        months.forEach(month => {
            const date = `${currentYear}-${month}-01`; // Use first day of month
            // Simulate CA HT
            transformedData.push({
                date: date,
                original_pennylane_account: "Ventes",
                amount: Math.random() * 50000 + 10000, // Random value for demo
                restaurant_id: restaurantId, // Assign the correct restaurant ID
            });
            // Simulate Achats Matières Premières
            transformedData.push({
                date: date,
                original_pennylane_account: "Fournisseurs Matériel & Équipements",
                amount: -(Math.random() * 10000 + 1000), // Negative for expenses
                restaurant_id: restaurantId, // Assign the correct restaurant ID
            });
            // Simulate Achats Marchandises
            transformedData.push({
                date: date,
                original_pennylane_account: "Fournisseurs Alimentaires",
                amount: -(Math.random() * 15000 + 2000), // Negative for expenses
                restaurant_id: restaurantId, // Assign the correct restaurant ID
            });
            // Add other relevant accounts from your `pennylaneToKPIMapping` here
            // based on what Pennylane API returns.
        });


        // --- Step 3: Clear existing data for the synced period and restaurant (optional but recommended for full sync) ---
        const { error: deleteError } = await supabase
            .from('financial_data')
            .delete()
            .eq('restaurant_id', restaurantId) // Filter by restaurant ID
            .gte('date', `${currentYear}-01-01`) // Delete from Jan 1st of current year
            .lte('date', `${currentYear}-06-30`); // Up to June 30th of current year

        if (deleteError) {
            console.error("Erreur lors de la suppression des données existantes:", deleteError);
            // Decide if you want to throw or just warn and continue with upsert
        }

        // --- Step 4: Upsert transformed data into Supabase ---
        await upsertFinancialData(transformedData);

        res.json({ message: 'Synchronisation Pennylane réussie !' });

    } catch (error) {
        console.error('Erreur lors de la synchronisation avec Pennylane :', error);
        res.status(500).json({ error: 'Échec de la synchronisation avec Pennylane : ' + error.message });
    }
});


// --- NEW API Endpoints for Restaurants Management ---

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*');

        if (error) {
            console.error("Error fetching restaurants:", error);
            res.status(500).json({ error: 'Failed to fetch restaurants' });
        } else {
            res.json(data);
        }
    } catch (error) {
        console.error("Unexpected error in /api/restaurants GET:", error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Add a new restaurant
app.post('/api/restaurants', async (req, res) => {
    const { name, address, city, zip_code, country, phone, email } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Restaurant name is required' });
    }
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .insert([{ name, address, city, zip_code, country, phone, email }])
            .select(); // Return the inserted data

        if (error) {
            console.error("Error adding restaurant:", error);
            res.status(500).json({ error: 'Failed to add restaurant' });
        } else {
            res.status(201).json(data[0]); // Return the first (and only) inserted record
        }
    } catch (error) {
        console.error("Unexpected error in /api/restaurants POST:", error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Update a restaurant
app.put('/api/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error("Error updating restaurant:", error);
            res.status(500).json({ error: 'Failed to update restaurant' });
        } else if (!data || data.length === 0) {
            res.status(404).json({ error: 'Restaurant not found' });
        } else {
            res.json(data[0]);
        }
    } catch (error) {
        console.error("Unexpected error in /api/restaurants PUT:", error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Delete a restaurant
app.delete('/api/restaurants/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting restaurant:", error);
            res.status(500).json({ error: 'Failed to delete restaurant' });
        } else {
            res.status(204).send(); // No content to send back on successful deletion
        }
    } catch (error) {
        console.error("Unexpected error in /api/restaurants DELETE:", error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Le backend de RestoPilot écoute sur le port ${port}`);
});
