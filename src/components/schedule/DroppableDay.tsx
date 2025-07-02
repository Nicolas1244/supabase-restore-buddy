import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Shift, Employee, DAILY_STATUS, POSITIONS } from '../../types';
import DraggableShift from './DraggableShift';
import { useAppContext } from '../../contexts/AppContext';
import { USER_ROLES } from '../../types';
import { Plus, Scissors, AlertTriangle, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateTimeInHours } from '../../lib/scheduleUtils';

interface DroppableDayProps {
  dayIndex: number;
  shifts: Shift[];
  employees: Employee[];
  onShiftClick: (shift: Shift) => void;
  isReadOnly?: boolean;
}

const DroppableDay: React.FC<DroppableDayProps> = ({
  dayIndex,
  shifts,
  employees,
  onShiftClick,
  isReadOnly = false
}) => {
  const { getCurrentUserRole, checkAvailabilityConflicts, getEmployeePreferences } = useAppContext();
  const { t, i18n } = useTranslation();
  const userRole = getCurrentUserRole();
  
  // Only enable drop functionality for administrators and managers
  const isDropDisabled = isReadOnly || userRole === USER_ROLES.EMPLOYEE;
  
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}`,
    disabled: isDropDisabled
  });

  const getEmployee = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

  // Group shifts by employee
  const shiftsByEmployee: Record<string, Shift[]> = {};
  shifts.forEach(shift => {
    if (!shiftsByEmployee[shift.employeeId]) {
      shiftsByEmployee[shift.employeeId] = [];
    }
    shiftsByEmployee[shift.employeeId].push(shift);
  });

  // Check for conflicts
  const getConflicts = (employeeId: string, shift: Shift) => {
    if (!shift.start || !shift.end || shift.status) return { hasAvailabilityConflict: false, hasPreferenceConflict: false };
    
    // Check availability conflicts
    const availabilityConflict = checkAvailabilityConflicts(employeeId, shift.day, shift.start, shift.end);
    
    // Check preference conflicts
    const preferences = getEmployeePreferences(employeeId);
    const hasPreferenceConflict = preferences ? !preferences.preferredDays.includes(shift.day) : false;
    
    return {
      hasAvailabilityConflict: availabilityConflict.hasConflict,
      hasPreferenceConflict
    };
  };

  return (
    <div
      ref={setNodeRef}
      className={`p-2 border-r min-h-[120px] relative group ${
        isOver ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {Object.entries(shiftsByEmployee).map(([employeeId, employeeShifts]) => {
        // Check if there's a status shift (like absence)
        const statusShift = employeeShifts.find(s => s.status);
        
        if (statusShift) {
          // Render status shift
          const employee = getEmployee(employeeId);
          if (!employee) return null;
          
          return (
            <div 
              key={statusShift.id}
              className="flex flex-col items-center justify-center h-full"
              onClick={() => onShiftClick(statusShift)}
            >
              <div 
                className="px-2 py-1 rounded-md text-center text-xs font-medium"
                style={{ 
                  backgroundColor: `${DAILY_STATUS[statusShift.status!].color}20`,
                  color: DAILY_STATUS[statusShift.status!].color,
                  border: `1px solid ${DAILY_STATUS[statusShift.status!].color}40`
                }}
              >
                {DAILY_STATUS[statusShift.status!].label}
              </div>
            </div>
          );
        } else {
          // Render regular shifts
          return employeeShifts.map(shift => {
            const employee = getEmployee(employeeId);
            if (!employee) return null;
            
            const { hasAvailabilityConflict, hasPreferenceConflict } = getConflicts(employeeId, shift);
            
            return (
              <div key={shift.id} className="relative">
                <DraggableShift
                  shift={shift}
                  employee={employee}
                  onShiftClick={onShiftClick}
                  isReadOnly={isReadOnly}
                />
                
                {/* Conflict indicators */}
                {(hasAvailabilityConflict || hasPreferenceConflict) && (
                  <div className="absolute top-1 right-1 flex space-x-1">
                    {hasAvailabilityConflict && (
                      <div className="text-red-500" title="Conflit de disponibilité">
                        <AlertTriangle size={12} />
                      </div>
                    )}
                    {hasPreferenceConflict && !hasAvailabilityConflict && (
                      <div className="text-yellow-500" title="Ne correspond pas aux préférences">
                        <Heart size={12} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          });
        }
      })}
      
      {/* Add shift button - only for admin/manager and if no status shift */}
      {!isReadOnly && 
       !Object.values(shiftsByEmployee).some(shifts => shifts.some(s => s.status)) &&
       (userRole === USER_ROLES.ADMINISTRATOR || userRole === USER_ROLES.MANAGER) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Find first employee to add shift for (in a real app, this would be more sophisticated)
            if (employees.length > 0) {
              onShiftClick({
                id: 'new',
                employeeId: employees[0].id,
                day: dayIndex,
                start: '09:00',
                end: '17:00',
                position: employees[0].position,
                type: 'morning',
                restaurantId: employees[0].restaurantId
              });
            }
          }}
          className="w-full flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded p-1 text-xs mt-2"
        >
          <Plus size={14} className="mr-1" />
          <span>
            {i18n.language === 'fr' ? 'Ajouter' : 'Add'}
          </span>
        </button>
      )}
    </div>
  );
};

export default DroppableDay;
