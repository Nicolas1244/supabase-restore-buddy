
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Users, Calendar } from 'lucide-react';

export default function TimeClock() {
  const activeEmployees = [
    {
      id: 1,
      name: "John Smith",
      clockIn: "9:00 AM",
      duration: "4h 30m",
      location: "Downtown Location",
      status: "clocked-in"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      clockIn: "2:00 PM",
      duration: "1h 15m",
      location: "Westside Branch",
      status: "clocked-in"
    },
    {
      id: 3,
      name: "Mike Wilson",
      clockIn: "8:00 AM",
      duration: "5h 45m",
      location: "Mall Food Court",
      status: "on-break"
    }
  ];

  const recentActivity = [
    { employee: "Emma Davis", action: "Clocked Out", time: "3:45 PM", location: "Downtown" },
    { employee: "Alex Brown", action: "Started Break", time: "3:30 PM", location: "Westside" },
    { employee: "Lisa Wilson", action: "Clocked In", time: "3:15 PM", location: "Mall" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Time Clock Management</h1>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          View Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Users className="h-5 w-5" />
              Currently Working
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-sm text-gray-600">Employees clocked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              Total Hours Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">124.5</div>
            <p className="text-sm text-gray-600">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Play className="h-5 w-5" />
              On Break
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-gray-600">Employees on break</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Currently Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.location}</p>
                    <p className="text-sm">Clocked in: {employee.clockIn}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="font-medium">{employee.duration}</div>
                    <Badge 
                      variant={employee.status === 'clocked-in' ? 'default' : 'secondary'}
                    >
                      {employee.status === 'clocked-in' ? 'Working' : 'On Break'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{activity.employee}</span>
                    <span className="text-sm text-gray-600 ml-2">{activity.action}</span>
                    <p className="text-xs text-gray-500">{activity.location}</p>
                  </div>
                  <span className="text-sm font-medium">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
