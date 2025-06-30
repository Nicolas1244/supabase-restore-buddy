
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, Plus } from 'lucide-react';

export default function Restaurants() {
  const restaurants = [
    {
      id: 1,
      name: "Downtown Location",
      address: "123 Main St, Downtown",
      employees: 28,
      status: "Active",
      manager: "John Doe"
    },
    {
      id: 2,
      name: "Westside Branch",
      address: "456 West Ave, Westside",
      employees: 22,
      status: "Active",
      manager: "Jane Smith"
    },
    {
      id: 3,
      name: "Mall Food Court",
      address: "789 Shopping Center, Mall",
      employees: 15,
      status: "Active",
      manager: "Mike Johnson"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Restaurant Locations</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {restaurant.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {restaurant.address}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{restaurant.employees} employees</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Manager: {restaurant.manager}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  restaurant.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.status}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
