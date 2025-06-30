
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Award } from 'lucide-react';

export default function Performance() {
  const metrics = [
    {
      title: "Sales Performance",
      value: "$45,280",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      period: "This month"
    },
    {
      title: "Customer Satisfaction",
      value: "4.6/5.0",
      change: "+0.3",
      trend: "up",
      icon: Award,
      period: "Average rating"
    },
    {
      title: "Employee Productivity",
      value: "92%",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      period: "Efficiency score"
    },
    {
      title: "Goal Achievement",
      value: "87%",
      change: "+5.2%",
      trend: "up",
      icon: Target,
      period: "Monthly targets"
    }
  ];

  const locationPerformance = [
    { name: "Downtown Location", sales: "$18,420", efficiency: "94%", satisfaction: "4.7" },
    { name: "Westside Branch", sales: "$15,890", efficiency: "89%", satisfaction: "4.5" },
    { name: "Mall Food Court", sales: "$10,970", efficiency: "91%", satisfaction: "4.6" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <div className="text-sm text-gray-600">
          Data updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-gray-600" />
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
            <CardTitle>Location Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationPerformance.map((location, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{location.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sales</span>
                      <div className="font-medium">{location.sales}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Efficiency</span>
                      <div className="font-medium">{location.efficiency}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating</span>
                      <div className="font-medium">{location.satisfaction}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Revenue Growth</span>
                <span className="text-green-600 font-bold">+15.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Customer Retention</span>
                <span className="text-blue-600 font-bold">89%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Average Order Value</span>
                <span className="text-orange-600 font-bold">$28.50</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Employee Satisfaction</span>
                <span className="text-purple-600 font-bold">4.2/5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
