import React from 'react';
import { useTranslation } from 'react-i18next';

interface KPIRowProps {
  label: string;
  value: number | string;
  n1Value?: number;
  budgetValue?: number;
  isPercentage?: boolean;
  isBold?: boolean;
}

const KPIRow: React.FC<KPIRowProps> = ({ label, value, n1Value, budgetValue, isPercentage = false, isBold = false }) => {
  const { t } = useTranslation();
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
        {displayValue}{isPercentage ? '%' : '€'}
      </span>
      <div className="col-span-1 text-right text-sm">
        {n1Value !== undefined && (
          <span className={`${n1DiffClass}`}>
            {n1Diff !== null && (parseFloat(n1Diff) > 0 ? `+${n1Diff}` : n1Diff)}{isPercentage ? '%' : '€'}
          </span>
        )}
      </div>
      <div className="col-span-1 text-right text-sm">
        {budgetValue !== undefined && (
          <span className={`${budgetDiffClass}`}>
            {budgetValue !== null && (parseFloat(budgetValue) > 0 ? `+${budgetValue}` : budgetValue)}{isPercentage ? '%' : '€'}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPIRow;
