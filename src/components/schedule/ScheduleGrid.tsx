import React, { useState, useMemo, useEffect } from 'react';
import { DAYS_OF_WEEK, Shift, Employee, DAILY_STATUS, DailyStatus, POSITIONS } from '../../types';
import { Clock, Plus, Scissors, AlertTriangle, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateEmployeeWeeklySummary, formatHoursDiff, formatHours } from '../../lib/scheduleUtils';
import { format, addDays, parseISO, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAppContext } from '../../contexts/AppContext';
import TimeInput from './TimeInputComponents';
import toast from 'react-hot-toast';

interface ScheduleGridProps {
  shifts: Shift[];
  employees: Employee[];
  onUpdateShift: (shift: Shift) => void;
  onAddShift: (shiftData: Omit<Shift, 'id'>) => void;
  onDeleteShift: (shiftId: string) => void;
  weekStartDate: Date;
  onOpenShiftModal: (employeeId: string, day: number) => void;
  isReadOnly?: boolean;
}

// CRITICAL: Generate time options from 09:00 to 02:00 in 15-minute increments
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 9; hour <= 26; hour++) {
    const displayHour = hour >= 24 ? hour - 24 : hour;
    for (let minute = 0; minute < 60; minute += 15) {
      options.push(
        `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      );
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// CRITICAL: Custom hook for responsive breakpoints
const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  shifts, 
  employees,
  onUpdateShift,
  onAddShift,
  onDeleteShift,
  weekStartDate,
  onOpenShiftModal,
  isReadOnly = false
}) => {
  const { t, i18n } = useTranslation();
  const { userSettings, currentRestaurant, checkAvailabilityConflicts, getEmployeePreferences } = useAppContext();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [availabilityConflicts, setAvailabilityConflicts] = useState<Record<string, boolean>>({});
  const [preferenceConflicts, setPreferenceConflicts] = useState<Record<string, boolean>>({});
  const [positionConflicts, setPositionConflicts] = useState<Record<string, boolean>>({});
  
  // CRITICAL: Get current responsive breakpoint
  const breakpoint = useResponsiveBreakpoint();

  // CRITICAL: Determine if we should use compact mode based on screen size and user preference
  const shouldUseCompactMode = useMemo(() => {
    // Force compact mode on smaller screens regardless of user setting
    if (breakpoint === 'xs' || breakpoint === 'sm') return true;
    
    // On medium screens, respect user setting but default to optimized
    if (breakpoint === 'md') {
      return userSettings?.scheduleLayoutType === 'optimized';
    }
    
    // On larger screens, fully respect user setting
    return userSettings?.scheduleLayoutType === 'optimized';
  }, [breakpoint, userSettings?.scheduleLayoutType]);

  // CRITICAL: Check for availability, preference, and position conflicts on component mount and when shifts change
  useEffect(() => {
    const newAvailabilityConflicts: Record<string, boolean> = {};
    const newPreferenceConflicts: Record<string, boolean> = {};
    const newPositionConflicts: Record<string, boolean> = {};
    
    shifts.forEach(shift => {
      if (shift.start && shift.end && !shift.status) {
        // Check availability conflicts
        const conflict = checkAvailabilityConflicts(shift.employeeId, shift.day, shift.start, shift.end);
        if (conflict.hasConflict) {
          const conflictKey = `${shift.employeeId}-${shift.day}-${shift.id}`;
          newAvailabilityConflicts[conflictKey] = true;
        }
        
        // Check preference conflicts
        const preferences = getEmployeePreferences(shift.employeeId);
        if (preferences) {
          // Check day preference
          const isDayPreferred = preferences.preferredDays.includes(shift.day);
          if (!isDayPreferred) {
            const conflictKey = `${shift.employeeId}-${shift.day}-${shift.id}`;
            newPreferenceConflicts[conflictKey] = true;
          }
          
          // Check position preference
          const employee = employees.find(e => e.id === shift.employeeId);
          if (employee && preferences.preferredPositions.length > 0) {
            const isPositionPreferred = preferences.preferredPositions.includes(employee.position);
            if (!isPositionPreferred) {
              const conflictKey = `${shift.employeeId}-${shift.day}-${shift.id}`;
              newPositionConflicts[conflictKey] = true;
            }
          }
        }
      }
    });
    
    setAvailabilityConflicts(newAvailabilityConflicts);
    setPreferenceConflicts(newPreferenceConflicts);
    setPositionConflicts(newPositionConflicts);
  }, [shifts, employees, checkAvailabilityConflicts, getEmployeePreferences]);

  // CRITICAL: Group shifts by employee and day
  const getShiftsForEmployeeDay = (employeeId: string, day: number) => {
    return shifts.filter(shift => 
      shift.employeeId === employeeId && 
      shift.day === day
    ).sort((a, b) => {
      // Sort by start time
      return a.start.localeCompare(b.start);
    });
  };

  // CRITICAL: Group shifts by shiftGroup
  const getShiftGroups = (employeeId: string, day: number) => {
    const employeeDayShifts = getShiftsForEmployeeDay(employeeId, day);
    
    // Group shifts by shiftGroup
    const groups: Record<string, Shift[]> = {};
    
    employeeDayShifts.forEach(shift => {
      const groupId = shift.shiftGroup || shift.id;
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(shift);
    });
    
    // Sort shifts within each group
    Object.values(groups).forEach(groupShifts => {
      groupShifts.sort((a, b) => {
        return a.start.localeCompare(b.start);
      });
    });
    
    return groups;
  };

  // CRITICAL: Check if a day has multiple shifts with coupures
  const hasCoupure = (employeeId: string, day: number): boolean => {
    const dayShifts = getShiftsForEmployeeDay(employeeId, day);
    return dayShifts.length > 1 || dayShifts.some(s => s.hasCoupure);
  };

  // Contract validation helper
  const isEmployeeActiveOnDay = (employee: Employee, day: number): boolean => {
    const shiftDate = addDays(weekStartDate, day);
    const contractStart = parseISO(employee.startDate);
    const contractEnd = employee.endDate ? parseISO(employee.endDate) : null;

    const isAfterStart = shiftDate >= contractStart;
    const isBeforeEnd = !contractEnd || shiftDate <= contractEnd;

    return isAfterStart && isBeforeEnd;
  };

  const showContractWarning = (employee: Employee, day: number) => {
    const shiftDate = addDays(weekStartDate, day);
    const contractStart = parseISO(employee.startDate);
    const contractEnd = employee.endDate ? parseISO(employee.endDate) : null;

    if (shiftDate < contractStart) {
      toast.error(
        `Attention : Vous ne pouvez pas planifier d'heures pour ${employee.firstName} ${employee.lastName} en dehors de sa période contractuelle (Date de début : ${format(contractStart, 'd MMMM yyyy')}).`,
        { duration: 5000 }
      );
      return true;
    }

    if (contractEnd && shiftDate > contractEnd) {
      toast.error(
        `Attention : Vous ne pouvez pas planifier d'heures pour ${employee.firstName} ${employee.lastName} en dehors de sa période contractuelle (Date de fin : ${format(contractEnd, 'd MMMM yyyy')}).`,
        { duration: 5000 }
      );
      return true;
    }

    return false;
  };

  // CRITICAL: Simplified and more robust time change handler
  const handleTimeChange = (
    employeeId: string,
    day: number,
    type: 'morning' | 'evening',
    field: 'start' | 'end',
    value: string
  ) => {
    if (isReadOnly) return; // Don't allow changes in read-only mode
    
    console.log('Time change triggered:', { employeeId, day, type, field, value });
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      console.error('Employee not found:', employeeId);
      return;
    }

    // CRITICAL: Ensure we have a current restaurant for new shifts
    if (!currentRestaurant) {
      console.error('No current restaurant selected');
      toast.error('Please select a restaurant first');
      return;
    }

    // Check contract validity before allowing time input
    if (!isEmployeeActiveOnDay(employee, day)) {
      showContractWarning(employee, day);
      return;
    }

    const existingShift = shifts.find(s => 
      s.employeeId === employeeId && 
      s.day === day && 
      s.type === type
    );

    if (existingShift) {
      // Update existing shift
      console.log('Updating existing shift:', existingShift.id);
      onUpdateShift({
        ...existingShift,
        [field]: value
      });
    } else {
      // Create new shift
      console.log('Creating new shift for restaurant:', currentRestaurant.id);
      const newShiftData = {
        employeeId,
        day,
        type,
        start: type === 'morning' ? '09:00' : '17:00',
        end: type === 'morning' ? '17:00' : '23:00',
        position: employee.position || '',
        restaurantId: currentRestaurant.id, // CRITICAL: Use current restaurant ID
        [field]: value
      };
      onAddShift(newShiftData);
    }
  };

  // CRITICAL: Enhanced status change handler with comprehensive logging and error handling
  const handleStatusChange = (
    employeeId: string,
    day: number,
    status: DailyStatus | ''
  ) => {
    if (isReadOnly) return; // Don't allow changes in read-only mode
    
    console.log('🔄 Status change triggered:', { employeeId, day, status });
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      console.error('❌ Employee not found:', employeeId);
      return;
    }

    console.log('✅ Employee found:', employee.firstName, employee.lastName);

    // CRITICAL: Ensure we have a current restaurant for new shifts
    if (!currentRestaurant) {
      console.error('No current restaurant selected');
      toast.error('Please select a restaurant first');
      return;
    }

    // Check contract validity for status changes (except clearing status)
    if (status && !isEmployeeActiveOnDay(employee, day)) {
      console.log('⚠️ Employee not active on this day, showing warning');
      showContractWarning(employee, day);
      return;
    }

    const dayShifts = getShiftsForEmployeeDay(employeeId, day);
    console.log('📋 Existing shifts for day:', dayShifts);
    
    if (dayShifts.length > 0) {
      // Update all existing shifts for this day with the new status
      console.log('🔄 Updating existing shifts with status:', status);
      dayShifts.forEach(shift => {
        const updatedShift = {
          ...shift,
          status: status || undefined,
          // Clear times for absence statuses (except PUBLIC_HOLIDAY)
          ...(status && status !== 'PUBLIC_HOLIDAY' ? {
            start: '',
            end: ''
          } : {})
        };
        console.log('📝 Updating shift:', shift.id, 'with data:', updatedShift);
        onUpdateShift(updatedShift);
      });
    } else if (status) {
      // Create new shift with status
      console.log('➕ Creating new shift with status:', status, 'for restaurant:', currentRestaurant.id);
      const newShiftData = {
        employeeId,
        day,
        type: 'morning' as const,
        start: status === 'PUBLIC_HOLIDAY' ? '09:00' : '',
        end: status === 'PUBLIC_HOLIDAY' ? '17:00' : '',
        position: employee.position || '',
        restaurantId: currentRestaurant.id, // CRITICAL: Use current restaurant ID
        status: status as DailyStatus
      };
      console.log('📝 Creating shift with data:', newShiftData);
      onAddShift(newShiftData);
    }
    
    console.log('✅ Status change completed');
  };

  const shouldDisableTimeInputs = (status: DailyStatus | undefined): boolean => {
    if (!status) return false;
    return status !== 'PUBLIC_HOLIDAY';
  };

  const getTimeDisplayValue = (shift: Shift | undefined, field: 'start' | 'end', isDisabled: boolean): string => {
    if (isDisabled) return '';
    return shift?.[field] || '';
  };

  const formatDayDate = (date: Date): string => {
    if (i18n.language === 'fr') {
      const formattedDate = format(date, 'd MMMM', { locale: fr });
      return formattedDate.replace(/\b\w/g, (char) => char.toUpperCase());
    } else {
      return format(date, 'd MMM');
    }
  };

  // CRITICAL: Check if employee already has maximum shifts for a day
  const hasMaxShifts = (employeeId: string, day: number): boolean => {
    const dayShifts = shifts.filter(shift => 
      shift.employeeId === employeeId && 
      shift.day === day &&
      !shift.status // Only count actual shifts, not status markers
    );
    return dayShifts.length >= 2;
  };

  // CRITICAL: Show helpful message if no employees
  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
          <Clock size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('schedule.noEmployees') || 'No employees found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {currentRestaurant 
              ? `Add employees to ${currentRestaurant.name} to start creating schedules.`
              : 'Please select a restaurant and add employees to start scheduling.'
            }
          </p>
          <button
            onClick={() => {
              const { setCurrentTab } = useAppContext();
              setCurrentTab('staff');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('staff.addEmployee') || 'Add Employee'}
          </button>
        </div>
      </div>
    );
  }

  // CRITICAL: Comprehensive responsive grid classes with WEEKLY SUMMARY ALWAYS INCLUDED
  const getResponsiveGridClasses = () => {
    const baseClasses = {
      container: "bg-white rounded-lg shadow-sm overflow-hidden",
      table: "min-w-full",
    };

    // CRITICAL: Responsive grid configurations - WEEKLY SUMMARY COLUMN ALWAYS PRESENT
    switch (breakpoint) {
      case 'xs': // < 640px - Ultra compact mobile
        return {
          ...baseClasses,
          gridCols: "grid grid-cols-[80px_repeat(7,minmax(70px,1fr))_100px]", // RESTORED: Weekly summary column
          headerCell: "p-1 font-medium text-gray-700 text-center border-r bg-gray-50 text-xs",
          employeeCell: "w-[80px] p-1 bg-gray-50 border-r",
          dayCell: "p-1 border-r cursor-pointer",
          summaryCell: "w-[100px] p-1 bg-gray-50 border-r", // RESTORED: Summary cell
          timeInputContainer: "mb-1 p-0.5 rounded",
          timeInputRow: "flex gap-0.5",
          statusSelect: "w-full text-xs p-0.5 border rounded text-center",
          employeeName: "text-xs font-medium text-gray-800 leading-tight",
          employeePosition: "text-xs text-gray-600 leading-tight",
          employeeHours: "text-xs text-gray-600 flex items-center",
          employeeContract: "text-xs text-gray-500",
          dayHeader: "text-xs",
          dayDate: "text-xs text-gray-500",
          summaryTitle: "text-xs font-medium text-gray-700",
          summaryValue: "text-xs font-semibold",
          summaryDetail: "text-xs text-gray-500",
          clockIcon: 8,
          minHeight: "24px",
          addShiftButton: "p-0.5 text-xs",
          coupureIndicator: "text-[8px]",
          conflictIcon: 8
        };

      case 'sm': // 640px - 768px - Compact mobile/small tablet
        return {
          ...baseClasses,
          gridCols: "grid grid-cols-[90px_repeat(7,minmax(80px,1fr))_120px]", // RESTORED: Weekly summary column
          headerCell: "p-1.5 font-medium text-gray-700 text-center border-r bg-gray-50 text-xs",
          employeeCell: "w-[90px] p-1.5 bg-gray-50 border-r",
          dayCell: "p-1 border-r cursor-pointer",
          summaryCell: "w-[120px] p-1.5 bg-gray-50 border-r", // RESTORED: Summary cell
          timeInputContainer: "mb-1 p-0.5 rounded",
          timeInputRow: "flex gap-0.5",
          statusSelect: "w-full text-xs p-1 border rounded text-center",
          employeeName: "text-xs font-medium text-gray-800",
          employeePosition: "text-xs text-gray-600",
          employeeHours: "text-xs text-gray-600 flex items-center",
          employeeContract: "text-xs text-gray-500",
          dayHeader: "text-xs",
          dayDate: "text-xs text-gray-500",
          summaryTitle: "text-xs font-medium text-gray-700",
          summaryValue: "text-sm font-semibold",
          summaryDetail: "text-xs text-gray-500",
          clockIcon: 10,
          minHeight: "26px",
          addShiftButton: "p-1 text-xs",
          coupureIndicator: "text-[9px]",
          conflictIcon: 10
        };

      case 'md': // 768px - 1024px - Tablet/small laptop
        return {
          ...baseClasses,
          gridCols: shouldUseCompactMode 
            ? "grid grid-cols-[110px_repeat(7,minmax(90px,1fr))_140px]" // RESTORED: Weekly summary column
            : "grid grid-cols-[120px_repeat(7,minmax(100px,1fr))_160px]", // RESTORED: Weekly summary column
          headerCell: shouldUseCompactMode 
            ? "p-2 font-medium text-gray-700 text-center border-r bg-gray-50 text-sm"
            : "p-2.5 font-medium text-gray-700 text-center border-r bg-gray-50 text-sm",
          employeeCell: shouldUseCompactMode 
            ? "w-[110px] p-1.5 bg-gray-50 border-r"
            : "w-[120px] p-2 bg-gray-50 border-r",
          dayCell: shouldUseCompactMode ? "p-1.5 border-r cursor-pointer" : "p-2 border-r cursor-pointer",
          summaryCell: shouldUseCompactMode 
            ? "w-[140px] p-1.5 bg-gray-50 border-r" // RESTORED: Summary cell
            : "w-[160px] p-2 bg-gray-50 border-r", // RESTORED: Summary cell
          timeInputContainer: "mb-1 p-1 rounded",
          timeInputRow: "flex gap-0.5",
          statusSelect: "w-full text-xs p-1 border rounded text-center",
          employeeName: "text-sm font-medium text-gray-800",
          employeePosition: "text-xs text-gray-600",
          employeeHours: "text-xs text-gray-600 flex items-center",
          employeeContract: "text-xs text-gray-500",
          dayHeader: "text-sm",
          dayDate: "text-sm text-gray-500",
          summaryTitle: "text-sm font-medium text-gray-700",
          summaryValue: shouldUseCompactMode ? "text-sm font-semibold" : "text-lg font-semibold",
          summaryDetail: "text-sm text-gray-500",
          clockIcon: shouldUseCompactMode ? 10 : 12,
          minHeight: shouldUseCompactMode ? "28px" : "32px",
          addShiftButton: "p-1 text-sm",
          coupureIndicator: "text-xs",
          conflictIcon: shouldUseCompactMode ? 12 : 14
        };

      case 'lg': // 1024px - 1280px - Standard laptop
        return {
          ...baseClasses,
          gridCols: shouldUseCompactMode 
            ? "grid grid-cols-[120px_repeat(7,minmax(100px,1fr))_160px]" // RESTORED: Weekly summary column
            : "grid grid-cols-[140px_repeat(7,minmax(120px,1fr))_180px]", // RESTORED: Weekly summary column
          headerCell: shouldUseCompactMode 
            ? "p-2 font-medium text-gray-700 text-center border-r bg-gray-50 text-sm"
            : "p-3 font-medium text-gray-700 text-center border-r bg-gray-50",
          employeeCell: shouldUseCompactMode 
            ? "w-[120px] p-2 bg-gray-50 border-r"
            : "w-[140px] p-2 bg-gray-50 border-r",
          dayCell: shouldUseCompactMode ? "p-1.5 border-r cursor-pointer" : "p-2 border-r cursor-pointer",
          summaryCell: shouldUseCompactMode 
            ? "w-[160px] p-2 bg-gray-50 border-r" // RESTORED: Summary cell
            : "w-[180px] p-2 bg-gray-50 border-r", // RESTORED: Summary cell
          timeInputContainer: shouldUseCompactMode ? "mb-1 p-1 rounded" : "mb-1.5 p-1.5 rounded",
          timeInputRow: shouldUseCompactMode ? "flex gap-0.5" : "flex gap-1",
          statusSelect: shouldUseCompactMode 
            ? "w-full text-xs p-1 border rounded text-center"
            : "w-full text-xs p-1.5 border rounded",
          employeeName: "text-sm font-medium text-gray-800",
          employeePosition: "text-xs text-gray-600",
          employeeHours: "text-xs text-gray-600 flex items-center",
          employeeContract: "text-xs text-gray-500",
          dayHeader: "text-sm",
          dayDate: "text-sm text-gray-500",
          summaryTitle: "text-sm font-medium text-gray-700",
          summaryValue: shouldUseCompactMode ? "text-sm font-semibold" : "text-lg font-semibold",
          summaryDetail: "text-sm text-gray-500",
          clockIcon: shouldUseCompactMode ? 10 : 12,
          minHeight: shouldUseCompactMode ? "28px" : "32px",
          addShiftButton: "p-1 text-sm",
          coupureIndicator: "text-sm",
          conflictIcon: shouldUseCompactMode ? 14 : 16
        };

      case 'xl': // > 1280px - Large desktop
      default:
        return {
          ...baseClasses,
          gridCols: shouldUseCompactMode 
            ? "grid grid-cols-[140px_repeat(7,minmax(120px,1fr))_180px]" // RESTORED: Weekly summary column
            : "grid grid-cols-[160px_repeat(7,minmax(140px,1fr))_200px]", // RESTORED: Weekly summary column
          headerCell: shouldUseCompactMode 
            ? "p-3 font-medium text-gray-700 text-center border-r bg-gray-50"
            : "p-3 font-medium text-gray-700 text-center border-r bg-gray-50",
          employeeCell: shouldUseCompactMode 
            ? "w-[140px] p-2 bg-gray-50 border-r"
            : "w-[160px] p-2 bg-gray-50 border-r",
          dayCell: shouldUseCompactMode ? "p-2 border-r cursor-pointer" : "p-2 border-r cursor-pointer",
          summaryCell: shouldUseCompactMode 
            ? "w-[180px] p-2 bg-gray-50 border-r" // RESTORED: Summary cell
            : "w-[200px] p-2 bg-gray-50 border-r", // RESTORED: Summary cell
          timeInputContainer: shouldUseCompactMode ? "mb-1.5 p-1.5 rounded" : "mb-1.5 p-1.5 rounded",
          timeInputRow: shouldUseCompactMode ? "flex gap-1" : "flex gap-1",
          statusSelect: shouldUseCompactMode 
            ? "w-full text-xs p-1.5 border rounded"
            : "w-full text-xs p-1.5 border rounded",
          employeeName: "text-sm font-medium text-gray-800",
          employeePosition: "text-xs text-gray-600",
          employeeHours: "text-xs text-gray-600 flex items-center",
          employeeContract: "text-xs text-gray-500",
          dayHeader: "",
          dayDate: "text-sm text-gray-500",
          summaryTitle: "text-sm font-medium text-gray-700",
          summaryValue: "text-lg font-semibold",
          summaryDetail: "text-sm text-gray-500",
          clockIcon: 12,
          minHeight: "32px",
          addShiftButton: "p-1.5 text-sm",
          coupureIndicator: "text-sm",
          conflictIcon: 16
        };
    }
  };

  const gridClasses = getResponsiveGridClasses();

  return (
    <div className={gridClasses.container}>
      {/* CRITICAL: FREEZE PANES - Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        {/* CRITICAL: Fixed Header Row - Employee and Day Headers */}
        <div className={gridClasses.table}>
          <div className={gridClasses.gridCols}>
            <div className={gridClasses.headerCell}>
              {t('staff.employee')}
            </div>
            
            {DAYS_OF_WEEK.map((day, index) => {
              const date = addDays(weekStartDate, index);
              return (
                <div key={index} className={gridClasses.headerCell}>
                  <div className={gridClasses.dayHeader}>{t(`days.${day.toLowerCase()}`)}</div>
                  <div className={gridClasses.dayDate}>
                    {formatDayDate(date)}
                  </div>
                </div>
              );
            })}
            
            {/* CRITICAL: Weekly Summary Header */}
            <div className={gridClasses.headerCell}>
              {t('schedule.weeklySummary')}
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL: Scrollable Employee Rows Section */}
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        <div className={gridClasses.table}>
          {employees.map(employee => {
            // CRITICAL: Pass break payment setting to calculation
            const { 
              totalWorkedHours,
              totalAssimilatedHours,
              totalPublicHolidayHours,
              hoursDiff,
              shiftCount,
              proRatedContractHours
            } = calculateEmployeeWeeklySummary(
              shifts.filter(s => s.employeeId === employee.id), 
              employee.weeklyHours || 35,
              employee.startDate, // CRITICAL: Pass employee start date
              employee.endDate,   // CRITICAL: Pass employee end date
              weekStartDate,      // CRITICAL: Pass week start date
              userSettings?.payBreakTimes // CRITICAL: Pass break payment setting with optional chaining
            );

            // Get employee preferences
            const preferences = getEmployeePreferences(employee.id);
            const hasPreferences = !!preferences;

            return (
              <div key={employee.id} className={`${gridClasses.gridCols} border-t hover:bg-gray-50 transition-colors`}>
                <div className={gridClasses.employeeCell}>
                  <div className={gridClasses.employeeName}>
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className={gridClasses.employeePosition}>
                    {/* CRITICAL FIX: Check if position is in predefined list before translating */}
                    {POSITIONS.includes(employee.position) 
                      ? t(`positions.${employee.position.toLowerCase().replace(/[^a-z]/g, '')}`)
                      : employee.position /* Display custom positions directly */}
                  </div>
                  <div className={gridClasses.employeeHours}>
                    <Clock size={gridClasses.clockIcon} className="mr-1" />
                    <span>{employee.weeklyHours || 35}H</span>
                    {/* CRITICAL: Show pro-rated hours if different from full contract */}
                    {Math.abs(proRatedContractHours - (employee.weeklyHours || 35)) > 0.1 && (
                      <span className="text-orange-600 ml-1">
                        ({formatHours(proRatedContractHours)})
                      </span>
                    )}
                  </div>
                  <div className={gridClasses.employeeContract}>
                    {format(parseISO(employee.startDate), 'dd/MM')}
                    {employee.endDate && ` - ${format(parseISO(employee.endDate), 'dd/MM')}`}
                  </div>
                  {/* CRITICAL: Show break payment indicator */}
                  {!userSettings?.payBreakTimes && (
                    <div className="text-xs text-orange-600 mt-1">
                      💰 Pauses non rémunérées
                    </div>
                  )}
                  {/* CRITICAL: Show preferences indicator */}
                  {hasPreferences && (
                    <div className="text-xs text-purple-600 mt-1 flex items-center">
                      <Heart size={10} className="mr-1" />
                      Préférences définies
                    </div>
                  )}
                </div>

                {DAYS_OF_WEEK.map((_, dayIndex) => {
                  const dayShifts = getShiftsForEmployeeDay(employee.id, dayIndex);
                  const dayStatus = dayShifts.length > 0 ? dayShifts[0].status : undefined;
                  
                  const isEmployeeActiveToday = isEmployeeActiveOnDay(employee, dayIndex);
                  const isTimeInputDisabled = shouldDisableTimeInputs(dayStatus) || isReadOnly;
                  
                  // CRITICAL: Check if this day has multiple shifts with coupures
                  const dayHasCoupure = hasCoupure(employee.id, dayIndex);
                  
                  // CRITICAL: Get shift groups for this day
                  const shiftGroups = getShiftGroups(employee.id, dayIndex);
                  
                  // CRITICAL: Check if employee already has maximum shifts for this day
                  const reachedMaxShifts = hasMaxShifts(employee.id, dayIndex);
                  
                  // CRITICAL: Check for availability or preference conflicts
                  const hasAvailabilityConflict = dayShifts.some(shift => {
                    const conflictKey = `${employee.id}-${dayIndex}-${shift.id}`;
                    return availabilityConflicts[conflictKey];
                  });
                  
                  const hasPreferenceConflict = dayShifts.some(shift => {
                    const conflictKey = `${employee.id}-${dayIndex}-${shift.id}`;
                    return preferenceConflicts[conflictKey];
                  });
                  
                  const hasPositionConflict = dayShifts.some(shift => {
                    const conflictKey = `${employee.id}-${dayIndex}-${shift.id}`;
                    return positionConflicts[conflictKey];
                  });
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`${gridClasses.dayCell} ${!isEmployeeActiveToday ? 'bg-gray-100' : ''} relative`}
                      onClick={() => {
                        if (!isReadOnly && isEmployeeActiveToday) {
                          onOpenShiftModal(employee.id, dayIndex);
                        } else if (!isReadOnly) {
                          showContractWarning(employee, dayIndex);
                        }
                      }}
                    >
                      {!isEmployeeActiveToday && (
                        <div className={`text-gray-400 text-center mb-1 ${gridClasses.employeeContract}`}>
                          Hors contrat
                        </div>
                      )}
                      
                      {/* CRITICAL: If there's a status, show it instead of shifts */}
                      {dayStatus ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="px-2 py-1 rounded-md text-center text-xs font-medium"
                            style={{ 
                              backgroundColor: `${DAILY_STATUS[dayStatus].color}20`,
                              color: DAILY_STATUS[dayStatus].color,
                              border: `1px solid ${DAILY_STATUS[dayStatus].color}40`
                            }}
                          >
                            {DAILY_STATUS[dayStatus].label}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* CRITICAL: If there are multiple shifts or coupures, show them */}
                          {Object.entries(shiftGroups).map(([groupId, groupShifts]) => (
                            <div key={groupId} className="mb-2">
                              {/* CRITICAL: Show each shift in the group */}
                              {groupShifts.map((shift, shiftIndex) => (
                                <div 
                                  key={shift.id} 
                                  className={`${gridClasses.timeInputContainer} ${
                                    shift.type === 'morning' ? 'bg-blue-100' : 'bg-purple-100'
                                  } hover:bg-opacity-80 transition-colors`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs font-medium">
                                      {shift.start} - {shift.end}
                                    </div>
                                    {shiftIndex < groupShifts.length - 1 && (
                                      <Scissors size={12} className="text-orange-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {/* CRITICAL: Show coupure indicator if there are multiple shifts */}
                              {groupShifts.length > 1 && (
                                <div className={`text-center text-orange-600 ${gridClasses.coupureIndicator}`}>
                                  {i18n.language === 'fr' ? 'Coupure' : 'Split shift'}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* CRITICAL: Add shift button - ONLY if less than 2 shifts */}
                          {isEmployeeActiveToday && !reachedMaxShifts && !isReadOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenShiftModal(employee.id, dayIndex);
                              }}
                              className={`w-full flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded ${gridClasses.addShiftButton}`}
                            >
                              <Plus size={14} className="mr-1" />
                              <span className="text-xs">
                                {i18n.language === 'fr' ? 'Ajouter' : 'Add'}
                              </span>
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* CRITICAL: Availability, preference, and position conflict indicators */}
                      {(hasAvailabilityConflict || hasPreferenceConflict || hasPositionConflict) && (
                        <div className="absolute top-1 right-1 flex space-x-1">
                          {hasAvailabilityConflict && (
                            <div className="text-red-500" title="Conflit de disponibilité">
                              <AlertTriangle size={gridClasses.conflictIcon} />
                            </div>
                          )}
                          {(hasPreferenceConflict || hasPositionConflict) && !hasAvailabilityConflict && (
                            <div className="text-yellow-500" title="Ne correspond pas aux préférences">
                              <Heart size={gridClasses.conflictIcon} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* CRITICAL: Enhanced Weekly Summary with Break Payment Indicator */}
                <div className={gridClasses.summaryCell}>
                  <div className="space-y-2">
                    <div>
                      <div className={gridClasses.summaryTitle}>
                        {t('schedule.totalWorkedHours')}
                        {/* CRITICAL: Show break payment indicator */}
                        {!userSettings?.payBreakTimes && (
                          <span className="text-orange-600 text-xs ml-1">
                            (Sans pauses)
                          </span>
                        )}
                      </div>
                      <div className={gridClasses.summaryValue}>
                        {formatHours(totalWorkedHours)}
                      </div>
                      {totalAssimilatedHours > 0 && (
                        <div className={gridClasses.summaryDetail}>
                          (+ {totalAssimilatedHours.toFixed(1)}H {t('schedule.cpHours')})
                        </div>
                      )}
                      {totalPublicHolidayHours > 0 && (
                        <div className={`text-gray-700 mt-1 ${gridClasses.summaryDetail}`}>
                          {t('schedule.publicHolidayHours')} : {formatHours(totalPublicHolidayHours)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className={gridClasses.summaryTitle}>
                        {t('schedule.overtimeHours')}
                        {/* CRITICAL: Show pro-rated indicator if different from full contract */}
                        {Math.abs(proRatedContractHours - (employee.weeklyHours || 35)) > 0.1 && (
                          <span className="text-orange-600 text-xs ml-1">
                            (Pro-rata)
                          </span>
                        )}
                      </div>
                      <div className={`${gridClasses.summaryValue} ${
                        hoursDiff > 0 ? 'text-orange-600' : hoursDiff < 0 ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {formatHoursDiff(hoursDiff)}
                      </div>
                      {/* CRITICAL: Show pro-rated contract hours for transparency */}
                      {Math.abs(proRatedContractHours - (employee.weeklyHours || 35)) > 0.1 && (
                        <div className={`${gridClasses.summaryDetail} text-orange-600`}>
                          Base: {formatHours(proRatedContractHours)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className={gridClasses.summaryTitle}>
                        {t('schedule.numberOfShifts')}
                      </div>
                      <div className={gridClasses.summaryValue}>
                        {shiftCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
