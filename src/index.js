import 'dotenv/config'; // Charge les variables du fichier .env pour les modules ES
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer'; // Middleware pour la gestion des téléchargements de fichiers
import csvParser from 'csv-parser'; // Bibliothèque pour l'analyse des données CSV
import { Readable } from 'stream'; // Utilitaire de flux Node.js
import * as XLSX from 'xlsx'; // Nouvelle bibliothèque pour lire les fichiers Excel
import cors from 'cors'; // Importation du module CORS

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
    let date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    let parts = dateValue.split('/');
    if (parts.length === 3) {
      // Supposons JJ/MM/AAAA
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    // Ajoutez d'autres formats de chaîne si nécessaire
  }
  return null; // Retourne null si la date ne peut pas être analysée
}


// Fonction pour insérer les données financières dans Supabase
async function insertFinancialData(data) {
  try {
    // Valide et transforme les données avant l'insertion
    const validatedData = data.map(item => {
      // Nettoyage et conversion du montant
      const amountString = String(item.Montant).replace(',', '.').replace('€', '').trim();
      const amount = parseFloat(amountString);

      // Conversion de la date avec la nouvelle fonction parseExcelDate
      const dateIso = parseExcelDate(item.Date);

      // Validation des champs critiques
      if (!dateIso || !item.Montant || !item['Types de dépenses/revenus'] || isNaN(amount)) {
        console.warn(`Ligne ignorée en raison de données requises manquantes, mal nommées ou invalides: Date='${item.Date}', Montant='${item.Montant}', Types de dépenses/revenus='${item['Types de dépenses/revenus']}', Montant converti=${amount}, Date convertie=${dateIso}. Ligne complète:`, item);
        return null; // Retourne null pour les lignes invalides
      }

      return {
        date: dateIso,
        original_pennylane_account: item['Types de dépenses/revenus'],
        category_mapped_to_kpi: getKPICategory(item['Types de dépenses/revenus']),
        amount: amount,
        restaurant_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      };
    }).filter(item => item !== null); // Filtre les lignes nulles (invalides)

    if (validatedData.length === 0) {
        throw new Error('Aucune donnée valide trouvée dans le fichier pour l\'insertion.');
    }

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

// Middleware CORS pour permettre les requêtes depuis le frontend
app.use(cors()); // Permet toutes les origines pour le développement

// Middleware pour analyser les corps de requête JSON (pour d'autres appels API potentiels)
app.use(express.json());

// --- Point de terminaison API pour télécharger un fichier CSV/Excel ---
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
            parsedData = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // raw: false pour tenter de formater les dates/nombres
        } else {
            return res.status(400).json({ error: 'Format de fichier non pris en charge. Veuillez télécharger un fichier CSV, XLS ou XLSX.' });
        }

        // Les données sont maintenant validées et mappées dans insertFinancialData
        await insertFinancialData(parsedData);
        res.json({ message: 'Fichier téléchargé et traité avec succès !' });

    } catch (error) {
        console.error('Erreur lors du traitement du fichier :', error);
        res.status(500).json({ error: 'Échec du traitement du fichier : ' + error.message });
    }
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
