
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, Mail, Phone } from 'lucide-react';

export default function Personnel() {
  const employees = [
    {
      id: 1,
      name: "John Smith",
      position: "Server",
      location: "Downtown Location",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      status: "Active",
      shift: "Morning"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Kitchen Staff",
      location: "Westside Branch",
      email: "sarah.j@email.com",
      phone: "(555) 234-5678",
      status: "Active",
      shift: "Evening"
    },
    {
      id: 3,
      name: "Mike Wilson",
      position: "Manager",
      location: "Mall Food Court",
      email: "mike.wilson@email.com",
      phone: "(555) 345-6789",
      status: "Active",
      shift: "Full Day"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Personnel Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search employees..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-gray-600">{employee.position} • {employee.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={employee.status === 'Active' ? 'default' : 'secondary'}
                  >
                    {employee.status}
                  </Badge>
                  <Badge variant="outline">{employee.shift}</Badge>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {employee.phone}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
                <Button variant="outline" size="sm">
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  Time Clock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
