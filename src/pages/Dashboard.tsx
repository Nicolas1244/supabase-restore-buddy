
import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Building2
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Restaurants"
          value="12"
          icon={<Building2 className="h-4 w-4 text-blue-600" />}
          trend="up"
          trendValue="+2 this month"
        />
        <MetricCard
          title="Active Employees"
          value="248"
          icon={<Users className="h-4 w-4 text-green-600" />}
          trend="up"
          trendValue="+12 this week"
        />
        <MetricCard
          title="Planned Hours"
          value="2,840"
          subtitle="This week"
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          trend="neutral"
        />
        <MetricCard
          title="Labor Cost %"
          value="28.5%"
          subtitle="Target: 30%"
          icon={<DollarSign className="h-4 w-4 text-orange-600" />}
          trend="up"
          trendValue="2.1% below target"
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monday</span>
                <span className="font-medium">42 shifts scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tuesday</span>
                <span className="font-medium">38 shifts scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wednesday</span>
                <span className="font-medium">45 shifts scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Thursday</span>
                <span className="font-medium">47 shifts scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Friday</span>
                <span className="font-medium">52 shifts scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weekend</span>
                <span className="font-medium">68 shifts scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sales Target</span>
                <span className="font-medium text-green-600">+8.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="font-medium">4.6/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employee Retention</span>
                <span className="font-medium text-green-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Labor Cost</span>
                <span className="font-medium">$18.50/hr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overtime Hours</span>
                <span className="font-medium text-red-600">156 hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">John Smith clocked in at Downtown Location</span>
              <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">New employee Sarah Johnson added to Westside Location</span>
              <span className="text-xs text-gray-500 ml-auto">15 min ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Schedule updated for next week at Main Street</span>
              <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
