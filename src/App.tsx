import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Colors for charts (inspired by Monday.com/Fygr.io)
const COLORS = ['#4F88F7', '#FFC107', '#28A745', '#DC3545', '#6F42C1', '#FD7E14'];

// Translation object for all UI texts
const translations = {
  fr: {
    headerTitle: "Compte de Gestion SPG DU RAIL",
    headerSubtitle: "Suivi de Performance Mensuel",
    section1Title: "1. Saisie des Données Mensuelles",
    productsRevenue: "Produits (Revenus)",
    caRestauration: "CA Restauration HT (€)",
    caBar: "CA Bar HT (€)",
    caAutresProduits: "Autres Produits HT (€)",
    costOfGoods: "Coût Matière",
    coutMatiereFood: "Coût Matière Food (€)",
    coutMatiereBoissons: "Coût Matière Boissons (€)",
    personnelCosts: "Charges de Personnel",
    salairesChargesSociales: "Salaires & Charges Sociales (€)",
    autresChargesPersonnel: "Autres Charges Personnel (€)",
    operatingExpenses: "Charges d'Exploitation",
    loyersChargesLocatives: "Loyers & Charges Locatives (€)",
    energieCharges: "Énergie (€)",
    assurances: "Assurances (€)",
    financeCompta: "Finance & Compta (€)",
    logicielsServicesWeb: "Logiciels & Services Web (€)",
    telephoneInternet: "Téléphone & Internet (€)",
    autresChargesExploitation: "Autres Charges Op. (€)",
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
  },
  en: {
    headerTitle: "SPG DU RAIL Management Report",
    headerSubtitle: "Monthly Performance Tracking",
    section1Title: "1. Monthly Data Entry",
    productsRevenue: "Products (Revenue)",
    caRestauration: "Restaurant Revenue HT (€)",
    caBar: "Bar Revenue HT (€)",
    caAutresProduits: "Other Products HT (€)",
    costOfGoods: "Cost of Goods",
    coutMatiereFood: "Cost of Goods Food (€)",
    coutMatiereBoissons: "Cost of Goods Beverages (€)",
    personnelCosts: "Personnel Costs",
    salairesChargesSociales: "Salaries & Social Charges (€)",
    autresChargesPersonnel: "Other Personnel Costs (€)",
    operatingExpenses: "Operating Expenses",
    loyersChargesLocatives: "Rent & Lease Charges (€)",
    energieCharges: "Energy (€)",
    assurances: "Insurance (€)",
    financeCompta: "Finance & Accounting (€)",
    logicielsServicesWeb: "Software & Web Services (€)",
    telephoneInternet: "Phone & Internet (€)",
    autresChargesExploitation: "Other Operating Exp. (€)",
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
  },
};

// Main App component
function App() {
  // State for current language (default to French)
  const [language, setLanguage] = useState('fr');
  const t = translations[language]; // Get current translations

  // State for input values
  const [inputs, setInputs] = useState({
    // Products (Revenue)
    caRestauration: 0,
    caBar: 0,
    caAutresProduits: 0,
    // Cost of Goods
    coutMatiereFood: 0,
    coutMatiereBoissons: 0,
    // Personnel Costs
    salairesChargesSociales: 0,
    autresChargesPersonnel: 0,
    // Operating Expenses
    loyersChargesLocatives: 0,
    energieCharges: 0,
    assurances: 0,
    financeCompta: 0,
    logicielsServicesWeb: 0,
    telephoneInternet: 0,
    autresChargesExploitation: 0, // Groups Travel, Restaurant (expense), Subcontracting, Taxes, Bank fees, Material & Equipment Suppliers
  });

  // State for comparison values (N-1 and Budget) for key aggregates
  const [comparisons, setComparisons] = useState({
    caTotalN1: 0,
    caTotalBudget: 0,
    margeBruteTotalN1: 0,
    margeBruteTotalBudget: 0,
    ebitdaN1: 0,
    ebitdaBudget: 0,
  });

  // State for calculated KPIs
  const [kpis, setKpis] = useState({
    // Revenue
    caTotal: 0,
    // Cost of Goods
    coutMatiereTotal: 0,
    ratioCoutMatiereTotalPct: 0,
    // Detailed Gross Margin
    margeBruteFood: 0,
    margeBruteFoodPct: 0,
    margeBruteBoissons: 0,
    margeBruteBoissonsPct: 0,
    margeBruteTotale: 0,
    margeBruteTotalePct: 0,
    // Personnel Costs
    chargesPersonnelTotal: 0,
    ratioChargesPersonnelTotalPct: 0,
    // Operating Expenses
    chargesExploitationTotal: 0,
    ratioChargesExploitationTotalPct: 0,
    // Final Profitability
    ebitda: 0,
    ebitdaPct: 0,
  });

  // Dummy data for historical trend chart (for demonstration)
  const [historicalData] = useState([
    { name: 'Jan', ca: 18000, ebitda: 3500 },
    { name: 'Fév', ca: 20000, ebitda: 4000 },
    { name: 'Mar', ca: 22000, ebitda: 4500 },
    { name: 'Avr', ca: 21000, ebitda: 4200 },
    { name: 'Mai', ca: 23000, ebitda: 4800 },
    { name: 'Juin', ca: 25000, ebitda: 5200 },
  ]);

  // Effect to recalculate KPIs whenever inputs or comparison values change
  useEffect(() => {
    const {
      caRestauration, caBar, caAutresProduits,
      coutMatiereFood, coutMatiereBoissons,
      salairesChargesSociales, autresChargesPersonnel,
      loyersChargesLocatives, energieCharges, assurances, financeCompta,
      logicielsServicesWeb, telephoneInternet, autresChargesExploitation,
    } = inputs;

    // --- Aggregate Calculations ---
    const caTotal = caRestauration + caBar + caAutresProduits;
    const coutMatiereTotal = coutMatiereFood + coutMatiereBoissons;
    const chargesPersonnelTotal = salairesChargesSociales + autresChargesPersonnel;
    const chargesExploitationTotal = loyersChargesLocatives + energieCharges + assurances +
                                     financeCompta + logicielsServicesWeb + telephoneInternet +
                                     autresChargesExploitation;

    // --- KPI Calculations ---
    const margeBruteFood = caRestauration - coutMatiereFood;
    const margeBruteFoodPct = caRestauration > 0 ? (margeBruteFood / caRestauration) * 100 : 0;

    const margeBruteBoissons = caBar - coutMatiereBoissons;
    const margeBruteBoissonsPct = caBar > 0 ? (margeBruteBoissons / caBar) * 100 : 0;

    const margeBruteTotale = caTotal - coutMatiereTotal;
    const margeBruteTotalePct = caTotal > 0 ? (margeBruteTotale / caTotal) * 100 : 0;

    const ebitda = margeBruteTotale - chargesPersonnelTotal - chargesExploitationTotal;
    const ebitdaPct = caTotal > 0 ? (ebitda / caTotal) * 100 : 0;

    const ratioCoutMatiereTotalPct = caTotal > 0 ? (coutMatiereTotal / caTotal) * 100 : 0;
    const ratioChargesPersonnelTotalPct = caTotal > 0 ? (chargesPersonnelTotal / caTotal) * 100 : 0;
    const ratioChargesExploitationTotalPct = caTotal > 0 ? (chargesExploitationTotal / caTotal) * 100 : 0;


    setKpis({
      caTotal,
      coutMatiereTotal,
      ratioCoutMatiereTotalPct,
      margeBruteFood,
      margeBruteFoodPct,
      margeBruteBoissons,
      margeBruteBoissonsPct,
      margeBruteTotale,
      margeBruteTotalePct,
      chargesPersonnelTotal,
      ratioChargesPersonnelTotalPct,
      chargesExploitationTotal,
      ratioChargesExploitationTotalPct,
      ebitda,
      ebitdaPct,
    });
  }, [inputs]); // Recalculate whenever any input changes

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: parseFloat(value) || 0,
    }));
  };

  // Handler for comparison input changes
  const handleComparisonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setComparisons(prevComparisons => ({
      ...prevComparisons,
      [name]: parseFloat(value) || 0,
    }));
  };

  // Helper component for a single input row
  const InputRow = ({ label, name, value }: { label: string; name: string; value: number }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <label htmlFor={name} className="text-gray-700 dark:text-gray-300 w-1/2 md:w-2/3 text-sm md:text-base">
        {label}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-1/2 md:w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-right focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm md:text-base"
        placeholder="0"
      />
    </div>
  );

  // Helper component for a single KPI display row with comparisons
  const KPIRow = ({ label, value, n1Value, budgetValue, isPercentage = false, isBold = false }:
    { label: string; value: number | string; n1Value?: number; budgetValue?: number; isPercentage?: boolean; isBold?: boolean }) => {
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter text-gray-900 dark:text-white p-4 sm:p-8">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 text-center flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.headerTitle}</h1>
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
        {/* Section Saisie des Données */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
            {t.section1Title}
          </h2>

          <div className="space-y-4">
            <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">{t.productsRevenue}</h3>
            <InputRow label={t.caRestauration} name="caRestauration" value={inputs.caRestauration} />
            <InputRow label={t.caBar} name="caBar" value={inputs.caBar} />
            <InputRow label={t.caAutresProduits} name="caAutresProduits" value={inputs.caAutresProduits} />

            <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mt-6 mb-2">{t.costOfGoods}</h3>
            <InputRow label={t.coutMatiereFood} name="coutMatiereFood" value={inputs.coutMatiereFood} />
            <InputRow label={t.coutMatiereBoissons} name="coutMatiereBoissons" value={inputs.coutMatiereBoissons} />

            <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mt-6 mb-2">{t.personnelCosts}</h3>
            <InputRow label={t.salairesChargesSociales} name="salairesChargesSociales" value={inputs.salairesChargesSociales} />
            <InputRow label={t.autresChargesPersonnel} name="autresChargesPersonnel" value={inputs.autresChargesPersonnel} />

            <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mt-6 mb-2">{t.operatingExpenses}</h3>
            <InputRow label={t.loyersChargesLocatives} name="loyersChargesLocatives" value={inputs.loyersChargesLocatives} />
            <InputRow label={t.energieCharges} name="energieCharges" value={inputs.energieCharges} />
            <InputRow label={t.assurances} name="assurances" value={inputs.assurances} />
            <InputRow label={t.financeCompta} name="financeCompta" value={inputs.financeCompta} />
            <InputRow label={t.logicielsServicesWeb} name="logicielsServicesWeb" value={inputs.logicielsServicesWeb} />
            <InputRow label={t.telephoneInternet} name="telephoneInternet" value={inputs.telephoneInternet} />
            <InputRow label={t.autresChargesExploitation} name="autresChargesExploitation" value={inputs.autresChargesExploitation} />
          </div>
        </section>

        {/* Section Indicateurs Clés de Performance (KPI's) */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
            {t.section2Title}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b pb-2 border-gray-200 dark:border-gray-700">
              <span>{t.indicator}</span>
              <span className="text-right">{t.currentMonth}</span>
              <span className="text-right">{t.vsN1}</span>
              <span className="text-right">{t.vsBudget}</span>
            </div>

            <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">{t.products}</h3>
            <KPIRow label={t.caTotal} value={kpis.caTotal} isBold n1Value={comparisons.caTotalN1} budgetValue={comparisons.caTotalBudget} />
            <div className="flex justify-between items-center py-2">
              <label htmlFor="caTotalN1" className="text-gray-700 dark:text-gray-300 text-sm">{t.caTotalN1}</label>
              <input type="number" id="caTotalN1" name="caTotalN1" value={comparisons.caTotalN1} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
            </div>
            <div className="flex justify-between items-center py-2">
              <label htmlFor="caTotalBudget" className="text-gray-700 dark:text-gray-300 text-sm">{t.caTotalBudget}</label>
              <input type="number" id="caTotalBudget" name="caTotalBudget" value={comparisons.caTotalBudget} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
            </div>

            <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mt-6 mb-2">{t.profitability}</h3>
            <KPIRow label={t.margeBruteTotale} value={kpis.margeBruteTotale} isBold n1Value={comparisons.margeBruteTotalN1} budgetValue={comparisons.margeBruteTotalBudget} />
            <KPIRow label={t.margeBruteTotalePct} value={kpis.margeBruteTotalePct} isPercentage />
            <KPIRow label={t.margeBruteFoodPct} value={kpis.margeBruteFoodPct} isPercentage />
            <KPIRow label={t.margeBruteBoissonsPct} value={kpis.margeBruteBoissonsPct} isPercentage />
            <div className="flex justify-between items-center py-2">
              <label htmlFor="margeBruteTotalN1" className="text-gray-700 dark:text-gray-300 text-sm">{t.margeBruteN1}</label>
              <input type="number" id="margeBruteTotalN1" name="margeBruteTotalN1" value={comparisons.margeBruteTotalN1} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
            </div>
            <div className="flex justify-between items-center py-2">
              <label htmlFor="margeBruteTotalBudget" className="text-gray-700 dark:text-gray-300 text-sm">{t.margeBruteBudget}</label>
              <input type="number" id="margeBruteTotalBudget" name="margeBruteTotalBudget" value={comparisons.margeBruteTotalBudget} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
            </div>

            <KPIRow label={t.ebitda} value={kpis.ebitda} isBold n1Value={comparisons.ebitdaN1} budgetValue={comparisons.ebitdaBudget} />
            <KPIRow label={t.ebitdaPct} value={kpis.ebitdaPct} isPercentage />
            <div className="flex justify-between items-center py-2">
              <label htmlFor="ebitdaN1" className="text-gray-700 dark:text-gray-300 text-sm">{t.ebitdaN1}</label>
              <input type="number" id="ebitdaN1" name="ebitdaN1" value={comparisons.ebitdaN1} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
            </div>
            <div className="flex justify-between items-center py-2">
              <label htmlFor="ebitdaBudget" className="text-gray-700 dark:text-gray-300 text-sm">{t.ebitdaBudget}</label>
              <input type="number" id="ebitdaBudget" name="ebitdaBudget" value={comparisons.ebitdaBudget} onChange={handleComparisonChange} className="p-1 border rounded-md text-right w-1/3 dark:bg-gray-800 dark:text-white text-sm" />
            </div>

            <h3 className="text-xl font-medium text-purple-600 dark:text-purple-400 mt-6 mb-2">{t.costControl}</h3>
            <KPIRow label={t.ratioCoutMatiereTotalPct} value={kpis.ratioCoutMatiereTotalPct} isPercentage />
            <KPIRow label={t.ratioChargesPersonnelTotalPct} value={kpis.ratioChargesPersonnelTotalPct} isPercentage />
            <KPIRow label={t.ratioChargesExploitationTotalPct} value={kpis.ratioChargesExploitationTotalPct} isPercentage />
          </div>
        </section>

        {/* Charts Section */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-1 xl:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
            {t.section3Title}
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4">{t.revenueDistribution}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t.restaurant, value: inputs.caRestauration },
                      { name: t.bar, value: inputs.caBar },
                      { name: t.other, value: inputs.caAutresProduits },
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
                      [inputs.caRestauration, inputs.caBar, inputs.caAutresProduits].map((entry, index) => (
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
                      { name: t.food, value: inputs.coutMatiereFood },
                      { name: t.beverages, value: inputs.coutMatiereBoissons },
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
                      [inputs.coutMatiereFood, inputs.coutMatiereBoissons].map((entry, index) => (
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
                      { name: t.rentCharges, value: inputs.loyersChargesLocatives },
                      { name: t.energy, value: inputs.energieCharges },
                      { name: t.otherOpExp, value: inputs.assurances + inputs.financeCompta + inputs.logicielsServicesWeb + inputs.telephoneInternet + inputs.autresChargesExploitation },
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
                      [kpis.chargesPersonnelTotal, inputs.loyersChargesLocatives, inputs.energieCharges, inputs.assurances + inputs.financeCompta + inputs.logicielsServicesWeb + inputs.telephoneInternet + inputs.autresChargesExploitation].map((entry, index) => (
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
