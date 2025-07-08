import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      headerTitle: "Compte de Gestion SPG DU RAIL",
      headerSubtitle: "Suivi de Performance Mensuel",
      section1Title: "1. Détail du Compte d'Exploitation",
      section2Title: "2. Indicateurs Clés de Performance (KPI's)",
      caTotal: "CA Total HT",
      margeBruteTotale: "Marge Brute Totale",
      ebitda: "EBITDA",
      footerCalculations: "Les calculs sont mis à jour en temps réel.",
      footerSimplified: "Ce compte de gestion est une version simplifiée à des fins de pilotage opérationnel.",
      footerComparisons: "Les comparaisons N-1 et Budget sont basées sur des saisies manuelles pour cette version.",
      label: "Libellé",
    },
  },
  en: {
    translation: {
      headerTitle: "SPG DU RAIL Management Report",
      headerSubtitle: "Monthly Performance Tracking",
      section1Title: "1. Income Statement Details",
      section2Title: "2. Key Performance Indicators (KPI's)",
      caTotal: "Total Revenue HT",
      margeBruteTotale: "Total Gross Margin",
      ebitda: "EBITDA",
      footerCalculations: "Calculations are updated in real-time.",
      footerSimplified: "This management report is a simplified version for operational steering purposes.",
      footerComparisons: "N-1 and Budget comparisons are based on manual entries for this version.",
      label: "Label",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
