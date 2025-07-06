import 'dotenv/config'; // Charge les variables du fichier .env pour les modules ES
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer'; // Middleware pour la gestion des téléchargements de fichiers
import csvParser from 'csv-parser'; // Bibliothèque pour l'analyse des données CSV
import { Readable } from 'stream'; // Utilitaire de flux Node.js

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

// Configuration de Multer pour la gestion des téléchargements de fichiers (stockage en mémoire pour le CSV)
const upload = multer({ storage: multer.memoryStorage() });

// --- Mappage définitif Pennylane vers KPI pour SPG DU RAIL ---
// Cet objet mappe les noms exacts des comptes Pennylane à vos catégories KPI standardisées.
const pennylaneToKPIMapping = {
    // A. REVENUS
    "Ventes": "Net Revenue - Restaurant Sales",
    "Aides / Subventions": "Net Revenue - Other Income (Aides, Apport, Virements)",
    "Apport en Compte Courant Associé": "Net Revenue - Other Income (Aides, Apport, Virements)",
    "Virement externe": "Net Revenue - Other Income (Aides, Apport, Virements)",

    // B. COÛT DES MARCHANDISES VENDUES
    "Fournisseurs Alimentaires": "Cost of Goods Sold - Food",
    "Fournisseurs Matériel & Équipements": "Cost of Goods Sold - Other Materials & Equipment",

    // C. COÛTS DU PERSONNEL
    "Salaires": "Personnel Costs",
    "Cotisations Comp. Retraites": "Personnel Costs",
    "Mutuelle & Prévoyance": "Personnel Costs",
    "URSSAF - DSN": "Personnel Costs",
    "URSSAF - TNS Guillaume HEREAULT": "Personnel Costs",
    "URSSAF TNS - Pascal OURDAN": "Personnel Costs",

    // D. DÉPENSES D'EXPLOITATION
    "Loyers": "Rent & Lease Charges",
    "Assurance": "Insurances",
    "Finance & Compta": "Fees & Professional Services",
    "Frais bancaires": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",
    "Déplacements": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",
    "Logiciels & Services Web": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",
    "Téléphone & Internet": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",
    "Restauration": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",
    "Sous-traitance & Prestations": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",
    "Impôts": "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)",

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

// Fonction pour insérer les données financières dans Supabase
async function insertFinancialData(data) {
  try {
    // Valide et transforme les données avant l'insertion
    const validatedData = data.map(item => ({
      // S'assure que ces champs critiques ne sont jamais des chaînes vides ou nulles
      original_pennylane_account: item.original_pennylane_account || 'Unknown Pennylane Account',
      category_mapped_to_kpi: getKPICategory(item.original_pennylane_account), // Utilise la fonction de mappage
      amount: parseFloat(item.amount) || 0, // S'assure que le montant est un nombre
      // Supposons que 'date' est présent et correctement formaté (AAAA-MM-JJ) depuis le CSV
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '2024-01-01', // Date par défaut si manquante
      // Assigne un ID de restaurant par défaut pour l'instant, ou récupère-le du contexte utilisateur
      restaurant_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    }));

    const { data: insertedData, error } = await supabase
      .from('financial_data')
      .insert(validatedData);

    if (error) {
      console.error('Erreur lors de l\'insertion des données financières :', error);
      throw error;
    }
    console.log('Données financières insérées avec succès :', insertedData);
    return insertedData;
  } catch (error) {
    console.error("Erreur lors de l'insertion des données :", error);
    throw error;
  }
}

// Middleware pour analyser les corps de requête JSON (pour d'autres appels API potentiels)
app.use(express.json());

// --- Point de terminaison API pour télécharger un fichier CSV ---
app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    const results = [];
    // Crée un flux lisible à partir du tampon (buffer) du fichier téléchargé
    const stream = Readable.from(req.file.buffer);

    stream.pipe(csvParser())
        .on('data', (row) => {
            // Validation de base pour les colonnes CSV requises
            if (!row.original_pennylane_account || !row.amount || !row.date) {
                console.warn("Ligne ignorée en raison de données requises manquantes :", row);
                return; // Ignore les lignes qui n'ont pas les données essentielles
            }
            results.push(row);
        })
        .on('end', async () => {
            try {
                // Insère les données analysées et transformées dans Supabase
                await insertFinancialData(results); // insertFinancialData gère le mappage et la validation
                res.json({ message: 'Fichier CSV téléchargé et traité avec succès' });
            } catch (error) {
                console.error('Erreur lors du traitement du CSV :', error);
                res.status(500).json({ error: 'Échec du traitement du CSV' });
            }
        })
        .on('error', (error) => {
            console.error('Erreur lors de l\'analyse du CSV :', error);
            res.status(500).json({ error: 'Échec de l\'analyse du CSV' });
        });
});

// --- Point de terminaison API pour récupérer les données financières ---
app.get('/api/financialData', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('financial_data')
            .select('*'); // Sélectionne toutes les colonnes pour l'instant

        if (error) {
            console.error("Erreur lors de la récupération des données financières depuis Supabase :", error);
            res.status(500).json({ error: 'Échec de la récupération des données financières' });
        } else {
            res.json(data);
        }
    } catch (error) {
        console.error("Erreur inattendue dans /api/financialData :", error);
        res.status(500).json({ error: 'Une erreur inattendue est survenue' });
    }
});

// Démarre le serveur Express
app.listen(port, () => {
  console.log(`Le backend de Nico's Insights écoute sur le port ${port}`);
});
