import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Shift, Employee, DAILY_STATUS, POSITIONS } from '../../types';
import { calculateTimeInHours } from '../../lib/scheduleUtils';

interface DraggableShiftProps {
  shift: Shift;
  employee: Employee;
  onShiftClick: (shift: Shift) => void;
  isReadOnly?: boolean;
}

const DraggableShift: React.FC<DraggableShiftProps> = ({ 
  shift, 
  employee, 
  onShiftClick,
  isReadOnly = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: shift.id,
    disabled: isReadOnly
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: shift.color || '#3B82F6',
    borderColor: shift.status ? shift.color : undefined,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}${minutes > 0 ? `:${minutes}` : ''} ${period}`;
  };

  // Calculate total hours for this shift
  const totalHours = shift.start && shift.end ? calculateTimeInHours(shift.start, shift.end) : 0;
  const formattedHours = totalHours > 0 ? `${Math.floor(totalHours)}h${Math.round((totalHours % 1) * 60).toString().padStart(2, '0')}` : '';

  // CRITICAL FIX: Check if position is in predefined list before translating
  const getPositionDisplay = (position: string): string => {
    if (POSITIONS.includes(position)) {
      // For predefined positions, use the position key for translation
      return position;
    } else {
      // For custom positions, display directly
      return position;
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...(isReadOnly ? {} : attributes)}
      {...(isReadOnly ? {} : listeners)}
      onClick={() => onShiftClick(shift)}
      className={`mb-2 p-2 rounded-md ${isReadOnly ? 'cursor-default' : 'cursor-move'} transform transition-all hover:scale-[1.02] hover:shadow-md ${
        shift.status ? 'bg-opacity-15 border-2' : ''
      }`}
      style={style}
    >
      <div className={shift.status ? 'text-gray-800' : 'text-white'}>
        <div className="font-medium text-sm flex items-center justify-between">
          <span>{`${employee.firstName} ${employee.lastName}`}</span>
          {/* Display total hours */}
          {!shift.status && formattedHours && (
            <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">
              {formattedHours}
            </span>
          )}
        </div>
        <div className="text-xs opacity-90">
          {shift.status ? DAILY_STATUS[shift.status].label : getPositionDisplay(shift.position)}
        </div>
        <div className="text-xs mt-1 opacity-80">
          {shift.start && shift.end ? `${formatTime(shift.start)} - ${formatTime(shift.end)}` : ''}
        </div>
      </div>
    </div>
  );
};

export default DraggableShift;