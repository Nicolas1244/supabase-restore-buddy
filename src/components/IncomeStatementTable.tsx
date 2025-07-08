import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface IncomeStatementData {
  month: string;
  realized: number;
  budget: number;
  kpiCategory: string; // Added KPI category
}

interface IncomeStatementRowProps {
  label: string;
  data: IncomeStatementData[];
  categoryColorMapping: any; // Added prop for color mapping
}

const IncomeStatementRow: React.FC<IncomeStatementRowProps> = ({ label, data, categoryColorMapping }) => {
  return (
    <tr>
      <td>
        {label}
        {data.length > 0 && ( // Only show pill if data exists for this category
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${categoryColorMapping[data[0].kpiCategory]?.bg || ''} ${categoryColorMapping[data[0].kpiCategory]?.text || ''}`}
          >
            {data[0].kpiCategory.split('-')[0]}
          </span>
        )}
      </td>
      {data.map((item, index) => (
        <td key={index}>
          <div className="flex flex-col">
            <span>{item.realized.toFixed(2)}</span>
            <span>{item.budget.toFixed(2)}</span>
          </div>
        </td>
      ))}
    </tr>
  );
};

const IncomeStatementTable: React.FC<{ categoryColorMapping: any }> = ({ categoryColorMapping }) => {
  const { t } = useTranslation();
  const [incomeStatementData, setIncomeStatementData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch income statement data from backend API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/financialData');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIncomeStatementData(data);
      } catch (error) {
        console.error('Error fetching income statement data:', error);
      }
    };
    fetchData();
  }, []);

  // Sample data (replace with actual data from backend)
  const sampleData = [
    { label: 'I. PRODUITS D\'EXPLOITATION', data: [{ month: 'Jan', realized: 10000, budget: 12000, kpiCategory: 'Net Revenue - Restaurant Sales' }, { month: 'Feb', realized: 11000, budget: 13000, kpiCategory: 'Net Revenue - Restaurant Sales' }] },
    { label: 'II. CHARGES D\'EXPLOITATION', data: [{ month: 'Jan', realized: 5000, budget: 6000, kpiCategory: 'Cost of Goods Sold - Food' }, { month: 'Feb', realized: 6000, budget: 7000, kpiCategory: 'Cost of Goods Sold - Food' }] },
  ];

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2">{t('label')}</th>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
            <th key={month} className="border border-gray-300 p-2">{month}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sampleData.map((row) => (
          <IncomeStatementRow key={row.label} {...row} categoryColorMapping={categoryColorMapping} />
        ))}
      </tbody>
    </table>
  );
};

export default IncomeStatementTable;
