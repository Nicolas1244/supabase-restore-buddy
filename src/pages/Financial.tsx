
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Calculator, PieChart } from 'lucide-react';

export default function Financial() {
  const financialMetrics = [
    {
      title: "Total Revenue",
      value: "$128,450",
      change: "+8.2%",
      trend: "up",
      period: "This month"
    },
    {
      title: "Labor Costs",
      value: "$36,608",
      change: "+2.1%",
      trend: "up",
      period: "28.5% of revenue"
    },
    {
      title: "Food Costs",
      value: "$38,535",
      change: "-1.5%",
      trend: "down",
      period: "30% of revenue"
    },
    {
      title: "Net Profit",
      value: "$53,307",
      change: "+12.8%",
      trend: "up",
      period: "41.5% margin"
    }
  ];

  const costBreakdown = [
    { category: "Labor", amount: "$36,608", percentage: "28.5%" },
    { category: "Food & Beverages", amount: "$38,535", percentage: "30.0%" },
    { category: "Rent & Utilities", amount: "$15,400", percentage: "12.0%" },
    { category: "Equipment & Maintenance", amount: "$7,800", percentage: "6.1%" },
    { category: "Marketing", amount: "$3,200", percentage: "2.5%" },
    { category: "Other Operating Expenses", amount: "$5,600", percentage: "4.4%" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <div className="text-sm text-gray-600">
          Period: {new Date().toLocaleDateString()} - {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-2 mt-2">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{metric.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costBreakdown.map((cost, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{cost.category}</span>
                  <div className="text-right">
                    <div className="font-bold">{cost.amount}</div>
                    <div className="text-xs text-gray-600">{cost.percentage}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financial Ratios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="text-green-600 font-bold">41.5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Labor Cost Ratio</span>
                <span className="text-blue-600 font-bold">28.5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Food Cost Ratio</span>
                <span className="text-orange-600 font-bold">30.0%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Revenue per Employee</span>
                <span className="text-purple-600 font-bold">$518</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Average Transaction</span>
                <span className="text-gray-600 font-bold">$28.50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
