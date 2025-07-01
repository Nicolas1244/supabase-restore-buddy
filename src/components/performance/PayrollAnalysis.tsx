// src/components/performance/PayrollAnalysis.tsx
import React, { useState } from 'react';
import { DollarSign, Users, Percent, BarChart3, PieChart } from 'lucide-react';
import { PerformanceMetrics, Employee, DateRange } from '../../types';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PayrollAnalysisProps {
  metrics: PerformanceMetrics[];
  employees: Employee[];
  dateRange: DateRange;
}

const PayrollAnalysis: React.FC<PayrollAnalysisProps> = ({ metrics, employees, dateRange }) => {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<'ratio' | 'distribution'>('ratio');

  // Calculate maxRatio. Handle empty metrics array to prevent errors
  const maxRatio = Math.max(1, metrics.reduce((max, metric) => Math.max(max, metric.staffCostRatio), 0));

  const sortedMetrics = [...metrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM yyyy', { locale: fr });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* ... (rest of the code remains the same) */}

      {/* Chart area */}
      <div className="p-6">
        {/* Ratio view */}
        {view === 'ratio' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              {i18n.language === 'fr' ? 'Évolution du ratio Masse Salariale / CA' : 'Staff Cost Ratio Evolution'}
            </h4>

            <div className="h-64 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                <span>{Math.round(maxRatio)}%</span>
                <span>{Math.round(maxRatio * 0.75)}%</span>
                <span>{Math.round(maxRatio * 0.5)}%</span>
                <span>{Math.round(maxRatio * 0.25)}%</span>
                <span>0%</span>
              </div>

              {/* Chart grid */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex flex-col justify-between">
                <div className="border-b border-gray-200 h-0"></div>
                <div className="border-b border-gray-200 h-0"></div>
                <div className="border-b border-gray-200 h-0"></div>
                <div className="border-b border-gray-200 h-0"></div>
                <div className="border-b border-gray-200 h-0"></div>
              </div>

              {/* Target line */}
              <div
                className="absolute left-12 right-0 border-t-2 border-dashed border-green-500 z-10"
                style={{ top: `${Math.max(0, 100 - (30 / maxRatio * 100))}%` }} // Added Math.max(0, ...)
              >
                <div className="absolute right-0 -top-6 bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                  {i18n.language === 'fr' ? 'Cible: 30%' : 'Target: 30%'}
                </div>
              </div>

              {/* Bars */}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex items-end">
                <div className="flex-1 flex items-end justify-around h-full">
                  {sortedMetrics.map((metric, index) => {
                    const ratio = metric.staffCostRatio;
                    const ratioColor =
                      ratio <= 25 ? 'bg-green-500' :
                        ratio <= 30 ? 'bg-blue-500' :
                          ratio <= 35 ? 'bg-yellow-500' :
                            'bg-red-500';

                    const barHeight = (ratio / maxRatio) * 100; // Calculate barHeight separately

                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-12 ${ratioColor} hover:opacity-80 transition-opacity rounded-t`}
                          style={{ height: `${Math.max(0, barHeight)}%` }} // Added Math.max(0, ...)
                          title={`${ratio.toFixed(1)}%`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                          {formatDate(metric.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex justify-center gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-700">≤ 25%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs text-gray-700">≤ 30%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-xs text-gray-700">≤ 35%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs text-gray-700">> 35%</span> </div>
            </div>
          </div>
        )}

        {/* Distribution view */}
        {view === 'distribution' && (
          <div>
            {/* ... (rest of the code remains the same) */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollAnalysis;
