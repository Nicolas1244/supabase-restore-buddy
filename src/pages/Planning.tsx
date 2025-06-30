
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, Clock } from 'lucide-react';

export default function Planning() {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const scheduleData = {
    'Monday': [
      { employee: 'John Smith', shift: '9:00 AM - 5:00 PM', position: 'Server' },
      { employee: 'Sarah Johnson', shift: '2:00 PM - 10:00 PM', position: 'Kitchen Staff' }
    ],
    'Tuesday': [
      { employee: 'Mike Wilson', shift: '8:00 AM - 4:00 PM', position: 'Manager' },
      { employee: 'John Smith', shift: '12:00 PM - 8:00 PM', position: 'Server' }
    ],
    'Wednesday': [
      { employee: 'Sarah Johnson', shift: '10:00 AM - 6:00 PM', position: 'Kitchen Staff' },
      { employee: 'Mike Wilson', shift: '1:00 PM - 9:00 PM', position: 'Manager' }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule Planning</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Shifts This Week</span>
              <span className="font-semibold">248</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hours Scheduled</span>
              <span className="font-semibold">2,840</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Open Shifts</span>
              <span className="font-semibold text-red-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overtime Hours</span>
              <span className="font-semibold text-orange-600">156</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekDays.map((day) => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{day}</h3>
                  <div className="space-y-2">
                    {scheduleData[day as keyof typeof scheduleData]?.map((shift, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div>
                          <span className="font-medium">{shift.employee}</span>
                          <span className="text-sm text-gray-600 ml-2">({shift.position})</span>
                        </div>
                        <span className="text-sm font-medium">{shift.shift}</span>
                      </div>
                    )) || (
                      <div className="text-gray-500 text-sm italic">No shifts scheduled</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
