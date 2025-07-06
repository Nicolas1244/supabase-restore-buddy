import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Couleurs pour les graphiques (inspirées de Monday.com/Fygr.io)
const COLORS = ['#4F88F7', '#FFC107', '#28A745', '#DC3545', '#6F42C1', '#FD7E14'];

// Translation object for all UI texts
const translations = {
  fr: {
    headerTitle: "Compte de Gestion SPG DU RAIL",
    headerSubtitle: "Suivi de Performance Mensuel",
    section1Title: "1. Détail du Compte d'Exploitation",
    uploadCsvButton: "Télécharger Fichier CSV/Excel",
    uploadSuccess: "Fichier téléchargé avec succès !",
    uploadError: "Erreur lors du téléchargement du fichier : ",
    fetchingData: "Chargement des données...",
    errorFetchingData: "Erreur lors du chargement des données : ",
    noDataAvailable: "Aucune donnée disponible. Veuillez télécharger un fichier CSV/Excel.",
    section2Title: "2. Indicateurs Clés de Performance (KPI's)",
    indicator: "Indicateur",
    currentMonth: "Mois Actuel",
    vsN1: "Vs N-1",
    vsBudget: "Vs Budget",
    products: "Produits",
    caTotal: "CA Total HT",
    caTotalN1: "CA Total N-1 (€)",
    caTotalBudget: "CA Total Budget (€)",
    profitability: "Rentabilité",
    margeBruteTotale: "Marge Brute Totale",
    margeBruteTotalePct: "Marge Brute Totale (%)",
    margeBruteFoodPct: "Marge Brute Food (%)",
    margeBruteBoissonsPct: "Marge Brute Boissons (%)",
    margeBruteN1: "Marge Brute N-1 (€)",
    margeBruteBudget: "Marge Brute Budget (€)",
    ebitda: "EBITDA",
    ebitdaPct: "EBITDA (%)",
    ebitdaN1: "EBITDA N-1 (€)",
    ebitdaBudget: "EBITDA Budget (€)",
    costControl: "Maîtrise des Coûts",
    ratioCoutMatiereTotalPct: "Ratio Coût Matière Total (%)",
    ratioChargesPersonnelTotalPct: "Ratio Charges Personnel Total (%)",
    ratioChargesExploitationTotalPct: "Ratio Charges Exploitation Total (%)",
    section3Title: "3. Visualisation des Performances",
    revenueDistribution: "Répartition du Chiffre d'Affaires HT",
    restaurant: "Restauration",
    bar: "Bar",
    other: "Autres",
    costOfGoodsDistribution: "Répartition Coût Matière",
    food: "Food",
    beverages: "Boissons",
    operatingExpensesDistribution: "Répartition Charges d'Exploitation",
    personnel: "Personnel",
    rentCharges: "Loyers & Charges",
    energy: "Énergie",
    otherOpExp: "Autres Charges Op.",
    caEbitdaEvolution: "Évolution CA & EBITDA (6 Mois)",
    revenue: "Chiffre d'Affaires",
    footerCalculations: "Les calculs sont mis à jour en temps réel.",
    footerSimplified: "Ce compte de gestion est une version simplifiée à des fins de pilotage opérationnel.",
    footerComparisons: "Les comparaisons N-1 et Budget sont basées sur des saisies manuelles pour cette version.",
    currencySymbol: "€",
    percentageSymbol: "%",
    revenuesSection: "A. PRODUITS",
    cogsSection: "B. COÛT DES MARCHANDISES VENDUES",
    personnelCostsSection: "C. COÛTS DU PERSONNEL",
    operatingExpensesSection: "D. DÉPENSES D'EXPLOITATION",
    nonOperatingSection: "Éléments Non-Opérationnels / Spécifiques",
  },
  en: {
    headerTitle: "SPG DU RAIL Management Report",
    headerSubtitle: "Monthly Performance Tracking",
    section1Title: "1. Income Statement Details",
    uploadCsvButton: "Upload CSV/Excel File",
    uploadSuccess: "File uploaded successfully!",
    uploadError: "Error uploading file: ",
    fetchingData: "Loading data...",
    errorFetchingData: "Error loading data: ",
    noDataAvailable: "No data available. Please upload a CSV/Excel file.",
    section2Title: "2. Key Performance Indicators (KPI's)",
    indicator: "Indicator",
    currentMonth: "Current Month",
    vsN1: "Vs N-1",
    vsBudget: "Vs Budget",
    products: "Products",
    caTotal: "Total Revenue HT",
    caTotalN1: "Total Revenue N-1 (€)",
    caTotalBudget: "Total Revenue Budget (€)",
    profitability: "Profitability",
    margeBruteTotale: "Total Gross Margin",
    margeBruteTotalePct: "Total Gross Margin (%)",
    margeBruteFoodPct: "Gross Margin Food (%)",
    margeBruteBoissonsPct: "Gross Margin Beverages (%)",
    margeBruteN1: "Gross Margin N-1 (€)",
    margeBruteBudget: "Gross Margin Budget (€)",
    ebitda: "EBITDA",
    ebitdaPct: "EBITDA (%)",
    ebitdaN1: "EBITDA N-1 (€)",
    ebitdaBudget: "EBITDA Budget (€)",
    costControl: "Cost Control",
    ratioCoutMatiereTotalPct: "Total Cost of Goods Ratio (%)",
    ratioChargesPersonnelTotalPct: "Total Personnel Cost Ratio (%)",
    ratioChargesExploitationTotalPct: "Total Operating Expenses Ratio (%)",
    section3Title: "3. Performance Visualization",
    revenueDistribution: "Revenue HT Distribution",
    restaurant: "Restaurant",
    bar: "Bar",
    other: "Other",
    costOfGoodsDistribution: "Cost of Goods Distribution",
    food: "Food",
    beverages: "Beverages",
    operatingExpensesDistribution: "Operating Expenses Distribution",
    personnel: "Personnel",
    rentCharges: "Rent & Charges",
    energy: "Energy",
    otherOpExp: "Other Op. Exp.",
    caEbitdaEvolution: "CA & EBITDA Evolution (6 Months)",
    revenue: "Revenue",
    footerCalculations: "Calculations are updated in real-time.",
    footerSimplified: "This management report is a simplified version for operational steering purposes.",
    footerComparisons: "N-1 and Budget comparisons are based on manual entries for this version.",
    currencySymbol: "€",
    percentageSymbol: "%",
    revenuesSection: "A. REVENUES",
    cogsSection: "B. COST OF GOODS SOLD",
    personnelCostsSection: "C. PERSONNEL COSTS",
    operatingExpensesSection: "D. OPERATING EXPENSES",
    nonOperatingSection: "Non-Operating / Specific Items",
  },
};

// Helper component for a single KPI display row with comparisons
const KPIRow = ({ label, value, n1Value, budgetValue, isPercentage = false, isBold = false, t }:
  { label: string; value: number | string; n1Value?: number; budgetValue?: number; isPercentage?: boolean; isBold?: boolean; t: any }) => {
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
  const n1Diff = typeof value === 'number' && n1Value !== undefined ? (value - n1Value).toFixed(2) : null;
  const budgetDiff = typeof value === 'number' && budgetValue !== undefined ? (value - budgetValue).toFixed(2) : null;

  const n1DiffClass = n1Diff !== null ? (parseFloat(n1Diff) >= 0 ? 'text-green-500' : 'text-red-500') : '';
  const budgetDiffClass = budgetDiff !== null ? (parseFloat(budgetDiff) >= 0 ? 'text-green-500' : 'text-red-500') : '';

  const valueClass = isBold ? 'font-extrabold text-lg' : 'font-bold';

  return (
    <div className={`grid grid-cols-4 gap-2 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 items-center ${isBold ? 'bg-gray-50 dark:bg-gray-700 rounded-md px-2' : ''}`}>
      <span className={`col-span-1 text-gray-700 dark:text-gray-300 ${isBold ? 'font-semibold' : ''}`}>{label}</span>
      <span className={`col-span-1 text-right ${valueClass} text-gray-800 dark:text-white`}>
        {displayValue}{isPercentage ? t.percentageSymbol : t.currencySymbol}
      </span>
      <div className="col-span-1 text-right text-sm">
        {n1Value !== undefined && (
          <span className={`${n1DiffClass}`}>
            {n1Diff !== null && (parseFloat(n1Diff) > 0 ? `+${n1Diff}` : n1Diff)}{isPercentage ? t.percentageSymbol : t.currencySymbol}
          </span>
        )}
      </div>
      <div className="col-span-1 text-right text-sm">
        {budgetValue !== undefined && (
          <span className={`${budgetDiffClass}`}>
            {budgetValue !== null && (parseFloat(budgetValue) > 0 ? `+${budgetValue}` : budgetValue)}{isPercentage ? t.percentageSymbol : t.currencySymbol}
          </span>
        )}
      </div>
    </div>
  );
};

function App() {
  const [language, setLanguage] = useState('fr');
  const t = translations[language];

  const [financialData, setFinancialData] = useState<any[]>([]); // State to hold fetched financial data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for comparison values (N-1 and Budget) - these will still be manual for now
  const [comparisons, setComparisons] = useState({
    caTotalN1: 0,
    caTotalBudget: 0,
    margeBruteTotalN1: 0,
    margeBruteTotalBudget: 0,
    ebitdaN1: 0,
    ebitdaBudget: 0,
  });

  // Placeholder for historical data for the bar chart
  const historicalData = useMemo(() => [
    { name: 'Jan', ca: 4000, ebitda: 2400 },
    { name: 'Fév', ca: 3000, ebitda: 1398 },
    { name: 'Mar', ca: 2000, ebitda: 980 },
    { name: 'Avr', ca: 2780, ebitda: 3908 },
    { name: 'Mai', ca: 1890, ebitda: 4800 },
    { name: 'Juin', ca: 2390, ebitda: 3800 },
  ], []);


  // Function to fetch financial data from backend
  const fetchFinancialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use direct localhost URL for fetch requests for Canvas preview compatibility
      const response = await fetch('http://localhost:3001/api/financialData');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFinancialData(data);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      // Provide a user-friendly message, explaining the Canvas preview limitation if applicable
      setError(`${t.errorFetchingData} ${err instanceof Error ? err.message : String(err)}. Si vous êtes en mode prévisualisation Canvas, cette erreur est attendue en raison des restrictions de sécurité. L'application devrait fonctionner correctement en local.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFinancialData();
  }, []); // Empty dependency array means this runs once on mount

  // Define mapping categories for frontend display (mirroring backend's logic for grouping)
  const categoryGroups = useMemo(() => ({
    revenues: [
      "Ventes",
      "Aides / Subventions",
      "Apport en Compte Courant Associé",
      "Virement externe"
    ],
    cogs: [
      "Fournisseurs Alimentaires",
      "Fournisseurs Matériel & Équipements"
    ],
    personnel: [
      "Salaires",
      "Cotisations Comp. Retraites",
      "Mutuelle & Prévoyance",
      "URSSAF - DSN",
      "URSSAF - TNS Guillaume HEREAULT",
      "URSSAF TNS - Pascal OURDAN"
    ],
    operatingExpenses: [
      "Loyers",
      "Assurance",
      "Finance & Compta",
      "Frais bancaires",
      "Déplacements",
      "Logiciels & Services Web",
      "Téléphone & Internet",
      "Restauration",
      "Sous-traitance & Prestations",
      "Impôts"
    ],
    nonOperating: [
      "Emprunts",
      "Remboursement en CC Associé",
      "Remboursement Prêt",
      "TVA à Décaisser",
      "Virement interne"
    ]
  }), []);


  // KPI calculations and aggregation of Pennylane accounts using useMemo
  const kpis = useMemo(() => {
    let caTotal = 0;
    let coutMatiereTotal = 0;
    let chargesPersonnelTotal = 0;
    let chargesExploitationTotal = 0;
    const aggregatedAccounts: Record<string, number> = {}; // To store sums for each original_pennylane_account

    financialData.forEach(item => {
      const amount = parseFloat(item.amount) || 0;
      const categoryMapped = item.category_mapped_to_kpi; // Use the mapped category
      const originalAccount = item.original_pennylane_account; // Use the original Pennylane account name

      // Aggregate by original Pennylane account for detailed view
      if (aggregatedAccounts[originalAccount]) {
        aggregatedAccounts[originalAccount] += amount;
      } else {
        aggregatedAccounts[originalAccount] = amount;
      }

      // Sum for KPI categories based on mapped categories
      // These conditions explicitly include only operational revenue and expense categories
      if (categoryMapped === "Net Revenue - Restaurant Sales" || categoryMapped === "Net Revenue - Other Income (Aides, Apport, Virements)") {
        caTotal += amount;
      }
      if (categoryMapped === "Cost of Goods Sold - Food" || categoryMapped === "Cost of Goods Sold - Other Materials & Equipment") {
        coutMatiereTotal += amount;
      }
      if (categoryMapped === "Personnel Costs") {
        chargesPersonnelTotal += amount;
      }
      if (categoryMapped === "Rent & Lease Charges" || categoryMapped === "Insurances" || categoryMapped === "Fees & Professional Services" || categoryMapped === "Other Operating Expenses (Banks, Travel, Software, Telecom, Misc)") {
        chargesExploitationTotal += amount;
      }
      // Categories mapped to "Non-Operating/Specific Items (Not for core P&L)" are intentionally excluded from these sums.
    });

    // Calculate Gross Margin and its percentage
    const margeBruteTotale = caTotal - coutMatiereTotal;
    const margeBruteTotalePct = caTotal > 0 ? (margeBruteTotale / caTotal) * 100 : 0;

    // EBITDA
    const ebitda = margeBruteTotale - chargesPersonnelTotal - chargesExploitationTotal;
    const ebitdaPct = caTotal > 0 ? (ebitda / caTotal) * 100 : 0;

    // Ratios
    const ratioCoutMatiereTotalPct = caTotal > 0 ? (coutMatiereTotal / caTotal) * 100 : 0;
    const ratioChargesPersonnelTotalPct = caTotal > 0 ? (chargesPersonnelTotal / caTotal) * 100 : 0;
    const ratioChargesExploitationTotalPct = caTotal > 0 ? (chargesExploitationTotal / caTotal) * 100 : 0;

    // For specific categories like Food/Beverages for charts, derive from aggregatedAccounts
    // These are based on the Pennylane account names expected from the import
    const caRestauration = aggregatedAccounts["Ventes"] || 0;
    const caBar = 0; // Assuming no specific "Ventes Bar" account for now, needs adjustment if present
    const caAutresProduits = (aggregatedAccounts["Aides / Subventions"] || 0) + (aggregatedAccounts["Apport en Compte Courant Associé"] || 0) + (aggregatedAccounts["Virement externe"] || 0);

    const coutMatiereFood = aggregatedAccounts["Fournisseurs Alimentaires"] || 0;
    const coutMatiereBoissons = aggregatedAccounts["Fournisseurs Matériel & Équipements"] || 0; // Assuming this covers beverages

    // Specific operating expenses for charts, derived from aggregatedAccounts
    const loyersChargesLocatives = aggregatedAccounts["Loyers"] || 0;
    const energieCharges = aggregatedAccounts["Énergie"] || 0; // Assuming "Énergie" exists in Pennylane accounts
    const assurances = aggregatedAccounts["Assurance"] || 0;
    const financeCompta = aggregatedAccounts["Finance & Compta"] || 0;
    const logicielsServicesWeb = aggregatedAccounts["Logiciels & Services Web"] || 0;
    const telephoneInternet = aggregatedAccounts["Téléphone & Internet"] || 0;
    const autresChargesExploitation = (aggregatedAccounts["Déplacements"] || 0) +
                                      (aggregatedAccounts["Restauration"] || 0) + // Assuming "Restauration" is an expense account
                                      (aggregatedAccounts["Sous-traitance & Prestations"] || 0) +
                                      (aggregatedAccounts["Impôts"] || 0) +
                                      (aggregatedAccounts["Frais bancaires"] || 0);


    return {
      caTotal,
      coutMatiereTotal,
      ratioCoutMatiereTotalPct,
      margeBruteFood: caRestauration - coutMatiereFood, // Recalculate based on specific revenues/costs
      margeBruteFoodPct: caRestauration > 0 ? ((caRestauration - coutMatiereFood) / caRestauration) * 100 : 0,
      margeBruteBoissons: caBar - coutMatiereBoissons,
      margeBruteBoissonsPct: caBar > 0 ? ((caBar - coutMatiereBoissons) / caBar) * 100 : 0,
      margeBruteTotale,
      margeBruteTotalePct,
      chargesPersonnelTotal,
      ratioChargesPersonnelTotalPct,
      chargesExploitationTotal,
      ratioChargesExploitationTotalPct,
      ebitda,
      ebitdaPct,
      // Values for charts
      caRestauration, caBar, caAutresProduits,
      coutMatiereFood, coutMatiereBoissons,
      loyersChargesLocatives, energieCharges, assurances, financeCompta, logicielsServicesWeb, telephoneInternet, autresChargesExploitation,
      aggregatedAccounts, // Pass aggregated data for detailed display
    };
  }, [financialData, categoryGroups]); // Recalculate KPIs when financialData or categoryGroups change

  // Handler for file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMessage(null);
    setUploadError(null);
    setIsLoading(true); // Show loading while uploading and processing

    const formData = new FormData();
    formData.append('file', file); // 'file' is the field name expected by backend

    try {
      // Use direct localhost URL for upload requests for Canvas preview compatibility
      const response = await fetch('http://localhost:3001/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setUploadMessage(t.uploadSuccess);
      await fetchFinancialData(); // Re-fetch data after successful upload
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError(`${t.uploadError} ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for comparison input changes
  const handleComparisonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setComparisons(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // Helper component to render a group of detailed line items
  const DetailedAccountGroup = ({ title, accounts, colorClass }: { title: string; accounts: string[]; colorClass: string }) => {
    // Filter accounts to only show those present in the aggregated data with a non-zero value
    const filteredAccounts = accounts.filter(account =>
      kpis.aggregatedAccounts[account] !== undefined && kpis.aggregatedAccounts[account] !== 0
    );

    if (filteredAccounts.length === 0) {
      return null; // Don't render section if no data for these accounts
    }

    return (
      <div className="mb-6">
        <h3 className={`text-xl font-medium ${colorClass} mb-3 border-b pb-2 border-gray-200 dark:border-gray-700`}>{title}</h3>
        {filteredAccounts.map(account => (
          <div key={account} className="flex justify-between items-center py-1.5 text-gray-700 dark:text-gray-300 text-base">
            <span>{account}</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {kpis.aggregatedAccounts[account]?.toFixed(2)} {t.currencySymbol}
            </span>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter text-gray-900 dark:text-white p-4 sm:p-8">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 text-center flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.headerTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.headerSubtitle}</p>
        {/* Language Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLanguage('fr')}
            className={`px-3 py-1 rounded-md text-sm font-semibold ${language === 'fr' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-md text-sm font-semibold ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
          >
            EN
          </button>
        </div>
      </header>

      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Section Upload Data & Detailed Income Statement */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
            {t.section1Title}
          </h2>

          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-6">
            <label htmlFor="csv-upload" className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out">
              {t.uploadCsvButton}
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadMessage && <p className="mt-2 text-green-500 text-sm">{uploadMessage}</p>}
            {uploadError && <p className="mt-2 text-red-500 text-sm">{uploadError}</p>}
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                Format attendu du fichier: `Date, Montant, Types de dépenses / revenus`
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t.fetchingData}</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : financialData.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t.noDataAvailable}</p>
          ) : (
            <div className="space-y-4">
              {/* Detailed Income Statement Sections */}
              <DetailedAccountGroup
                title={t.revenuesSection}
                accounts={categoryGroups.revenues}
                colorClass="text-blue-600 dark:text-blue-400"
              />

              <DetailedAccountGroup
                title={t.cogsSection}
                accounts={categoryGroups.cogs}
                colorClass="text-red-600 dark:text-red-400"
              />

              <DetailedAccountGroup
                title={t.personnelCostsSection}
                accounts={categoryGroups.personnel}
                colorClass="text-red-600 dark:text-red-400"
              />

              <DetailedAccountGroup
                title={t.operatingExpensesSection}
                accounts={categoryGroups.operatingExpenses}
                colorClass="text-red-600 dark:text-red-400"
              />

              <DetailedAccountGroup
                title={t.nonOperatingSection}
                accounts={categoryGroups.nonOperating}
                colorClass="text-gray-600 dark:text-gray-400"
              />
            </div>
          )}
        </section>

        {/* Section Key Performance Indicators (KPI's) */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
            {t.section2Title}
          </h2>

          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t.fetchingData}</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : financialData.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t.noDataAvailable}</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b pb-2 border-gray-200 dark:border-gray-700">
                <span>{t.indicator}</span>
                <span className="text-right">{t.currentMonth}</span>
                <span className="text-right">{t.vsN1}</span>
                <span className="text-right">
                  {t.vsBudget}
                </span>
              </div>

              <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">{t.products}</h3>
              <KPIRow label={t.caTotal} value={kpis.caTotal} isBold n1Value={comparisons.caTotalN1} budgetValue={comparisons.caTotalBudget} t={t} />
              {/* Manual comparison inputs remain for now */}
              <div className="flex justify-between items-center py-2">
                <label htmlFor="caTotalN1" className="text-gray-700 dark:text-gray-300 text-sm">{t.caTotalN1}</label>
                <input type="number" id="caTotalN1" name="caTotalN1" value={comparisons.caTotalN1} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
              </div>
              <div className="flex justify-between items-center py-2">
                <label htmlFor="caTotalBudget" className="text-gray-700 dark:text-gray-300 text-sm">{t.caTotalBudget}</label>
                <input type="number" id="caTotalBudget" name="caTotalBudget" value={comparisons.caTotalBudget} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
              </div>

              <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mt-6 mb-2">{t.profitability}</h3>
              <KPIRow label={t.margeBruteTotale} value={kpis.margeBruteTotale} isBold n1Value={comparisons.margeBruteTotalN1} budgetValue={comparisons.margeBruteTotalBudget} t={t} />
              <KPIRow label={t.margeBruteTotalePct} value={kpis.margeBruteTotalePct} isPercentage t={t} />
              <KPIRow label={t.margeBruteFoodPct} value={kpis.margeBruteFoodPct} isPercentage t={t} />
              <KPIRow label={t.margeBruteBoissonsPct} value={kpis.margeBruteBoissonsPct} isPercentage t={t} />
              <div className="flex justify-between items-center py-2">
                <label htmlFor="margeBruteTotalN1" className="text-gray-700 dark:text-gray-300 text-sm">{t.margeBruteN1}</label>
                <input type="number" id="margeBruteTotalN1" name="margeBruteTotalN1" value={comparisons.margeBruteTotalN1} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
              </div>
              <div className="flex justify-between items-center py-2">
                <label htmlFor="margeBruteTotalBudget" className="text-gray-700 dark:text-gray-300 text-sm">{t.margeBruteBudget}</label>
                <input type="number" id="margeBruteTotalBudget" name="margeBruteTotalBudget" value={comparisons.margeBruteTotalBudget} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
              </div>

              <KPIRow label={t.ebitda} value={kpis.ebitda} isBold n1Value={comparisons.ebitdaN1} budgetValue={comparisons.ebitdaBudget} t={t} />
              <KPIRow label={t.ebitdaPct} value={kpis.ebitdaPct} isPercentage t={t} />
              <div className="flex justify-between items-center py-2">
                <label htmlFor="ebitdaN1" className="text-gray-700 dark:text-gray-300 text-sm">{t.ebitdaN1}</label>
                <input type="number" id="ebitdaN1" name="ebitdaN1" value={comparisons.ebitdaN1} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
              </div>
              <div className="flex justify-between items-center py-2">
                <label htmlFor="ebitdaBudget" className="text-gray-700 dark:text-gray-300 text-sm">{t.ebitdaBudget}</label>
                <input type="number" id="ebitdaBudget" name="ebitdaBudget" value={comparisons.ebitdaBudget} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
              </div>

              <h3 className="text-xl font-medium text-purple-600 dark:text-purple-400 mt-6 mb-2">{t.costControl}</h3>
              <KPIRow label={t.ratioCoutMatiereTotalPct} value={kpis.ratioCoutMatiereTotalPct} isPercentage t={t} />
              <KPIRow label={t.ratioChargesPersonnelTotalPct} value={kpis.ratioChargesPersonnelTotalPct} isPercentage t={t} />
              <KPIRow label={t.ratioChargesExploitationTotalPct} value={kpis.ratioChargesExploitationTotalPct} isPercentage t={t} />
            </div>
          )}
        </section>

        {/* Charts Section */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-1 xl:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
            {t.section3Title}
          </h2>

          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t.fetchingData}</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : financialData.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{t.noDataAvailable}</p>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4">{t.revenueDistribution}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t.restaurant, value: kpis.caRestauration },
                        { name: t.bar, value: kpis.caBar },
                        { name: t.other, value: kpis.caAutresProduits },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {
                        [kpis.caRestauration, kpis.caBar, kpis.caAutresProduits].map((entry, index) => (
                          <Cell key={`cell-ca-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)} ${t.currencySymbol}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4">{t.costOfGoodsDistribution}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t.food, value: kpis.coutMatiereFood },
                        { name: t.beverages, value: kpis.coutMatiereBoissons },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {
                        [kpis.coutMatiereFood, kpis.coutMatiereBoissons].map((entry, index) => (
                          <Cell key={`cell-cm-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)} ${t.currencySymbol}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4">{t.operatingExpensesDistribution}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: t.personnel, value: kpis.chargesPersonnelTotal },
                        { name: t.rentCharges, value: kpis.loyersChargesLocatives },
                        { name: t.energy, value: kpis.energieCharges },
                        { name: t.otherOpExp, value: kpis.autresChargesExploitation },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#ffc658"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {
                        [kpis.chargesPersonnelTotal, kpis.loyersChargesLocatives, kpis.energieCharges, kpis.autresChargesExploitation].map((entry, index) => (
                          <Cell key={`cell-ce-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)} ${t.currencySymbol}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4">{t.caEbitdaEvolution}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#555" />
                    <YAxis yAxisId="left" orientation="left" stroke="#4F88F7" />
                    <YAxis yAxisId="right" orientation="right" stroke="#FFC107" />
                    <Tooltip formatter={(value) => `${value.toFixed(2)} ${t.currencySymbol}`} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ca" fill="#4F88F7" name={t.revenue} />
                    <Bar yAxisId="right" dataKey="ebitda" fill="#FFC107" name={t.ebitda} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm p-4">
        <p>{t.footerCalculations}</p>
        <p>{t.footerSimplified}</p>
        <p>{t.footerComparisons}</p>
      </footer>
    </div>
  );
}

export default App;
