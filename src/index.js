import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERREUR : Les variables d'environnement Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) ne sont pas définies.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const upload = multer({ storage: multer.memoryStorage() });

const pennylaneToKPIMapping = {
    "Ventes": "Net Revenue - Restaurant Sales",
    "Aides / Subventions": "Net Revenue - Other Income (Aides, Apport, Virements)",
    "Apport en Compte Courant Associé": "Net Revenue - Other Income (Aides, Apport, Virements)",
    "Virement externe": "Net Revenue - Other Income (Aides, Apport, Virements)",
    "Fournisseurs Alimentaires": "Cost of Goods Sold - Food",
    "Fournisseurs Matériel & Équipements": "Cost of Goods Sold - Other Materials & Equipment",
    "Salaires": "Personnel Costs",
    "Cotisations Comp. Retraites": "Personnel Costs",
    "Mutuelle & Prévoyance": "Personnel Costs",
    "URSSAF - DSN": "Personnel Costs",
    "URSSAF - TNS Guillaume HEREAULT": "Personnel Costs",
    "URSSAF TNS - Pascal OURDAN": "Personnel Costs",
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
    "Emprunts": "Non-Operating/Specific Items (Not for core P&L)",
    "Remboursement en CC Associé": "Non-Operating/Specific Items (Not for core P&L)",
    "Remboursement Prêt": "Non-Operating/Specific Items (Not for core P&L)",
    "TVA à Décaisser": "Non-Operating/Specific Items (Not for core P&L)",
    "Virement interne": "Non-Operating/Specific Items (Not for core P&L)"
};

function getKPICategory(pennylaneAccount) {
    return pennylaneToKPIMapping[pennylaneAccount] || "Uncategorized Financial Item";
}

function parseExcelDate(dateValue) {
  if (typeof dateValue === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(dateValue);
    const date = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } else if (typeof dateValue === 'string') {
    let parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date.toISOString().split('T')[0];
      }
    }
    let date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return null;
}

async function insertFinancialData(data) {
  try {
    console.log('Données reçues pour insertion (brut) :', JSON.stringify(data, null, 2));

    const validatedData = data.map((item, index) => {
      console.log(`Clés de l'élément ${index + 1}:`, Object.keys(item));

      const amountString = String(item.Montant || '').replace(/\s/g, '').replace('€', '').replace(/,/g, '').trim();
      const amount = parseFloat(amountString);

      const dateIso = parseExcelDate(item.Date);

      const originalPennylaneAccount = item['Types de dépenses / revenus'] || '';

      if (!dateIso || !originalPennylaneAccount || isNaN(amount)) {
        console.warn(`Ligne ${index + 1} ignorée en raison de données requises manquantes ou invalides: ` +
                     `Date='${item.Date}', Montant='${item.Montant}', Types de dépenses / revenus='${item['Types de dépenses / revenus']}', ` +
                     `Montant converti=${amount}, Date convertie=${dateIso}. Ligne complète:`, item);
        return null;
      }

      return {
        date: dateIso,
        original_pennylane_account: originalPennylaneAccount,
        category_mapped_to_kpi: getKPICategory(originalPennylaneAccount),
        amount: amount,
        restaurant_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      };
    }).filter(item => item !== null);

    if (validatedData.length === 0) {
        throw new Error('Aucune donnée valide trouvée dans le fichier pour l\'insertion.');
    }

    console.log('Données validées pour insertion (après parsing) :', JSON.stringify(validatedData, null, 2));

    const { data: insertedData, error } = await supabase
      .from('financial_data')
      .insert(validatedData);

    if (error) {
      console.error('Erreur lors de l\'insertion des données financières dans Supabase :', error);
      throw error;
    }
    console.log('Données financières insérées avec succès :', insertedData);
    return insertedData;
  } catch (error) {
    console.error("Erreur lors de l'insertion des données :", error);
    throw error;
  }
}

app.use(cors());
app.use(express.json());

app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
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
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet, { raw: false, header: 2 });
        } else {
            return res.status(400).json({ error: 'Format de fichier non pris en charge. Veuillez télécharger un fichier CSV, XLS ou XLSX.' });
        }

        await insertFinancialData(parsedData);
        res.json({ message: 'Fichier téléchargé et traité avec succès !' });

    } catch (error) {
        console.error('Erreur lors du traitement du fichier :', error);
        res.status(500).json({ error: 'Échec du traitement du fichier : ' + error.message });
    }
});

app.get('/api/financialData', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('financial_data')
            .select('*');

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

// --- NOUVEAU POINT DE TERMINAISON POUR LA RECHERCHE SIRET ---
app.post('/api/siret-lookup', (req, res) => {
  const { siret } = req.body;

  if (!siret) {
    return res.status(400).json({ error: 'SIRET number is required.' });
  }

  // Simulation de la recherche SIRET
  if (siret === '12345678900000') {
    res.json({
      name: "Restaurant Le Gourmet",
      address: "123 Rue de la Gastronomie",
      city: "Paris",
      zip_code: "75001",
      country: "France",
      phone: "+33123456789",
      email: "contact@legourmet.fr",
      siret: siret,
    });
  } else if (siret === '98765432100000') {
    res.json({
      name: "La Brasserie du Coin",
      address: "45 Avenue des Champs",
      city: "Lyon",
      zip_code: "69002",
      country: "France",
      phone: "+33456789012",
      email: "info@brasseriecoin.fr",
      siret: siret,
    });
  }
  else {
    res.status(404).json({ error: 'SIRET not found or invalid.' });
  }
});


app.listen(port, () => {
  console.log(`Le backend de Nico's Insights écoute sur le port ${port}`);
});
