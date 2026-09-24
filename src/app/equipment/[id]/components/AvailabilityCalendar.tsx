'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface BookedRange {
  start_date: string;
  end_date: string;
  status: 'booked' | 'blocked' | 'maintenance';
}

interface AvailabilityCalendarProps {
  equipmentId: string;
  onDateRangeSelect?: (startDate: string, endDate: string) => void;
  selectedStart?: string;
  selectedEnd?: string;
  readOnly?: boolean;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isInRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

function isBooked(dateStr: string, ranges: BookedRange[]): boolean {
  return ranges.some((r) => isInRange(dateStr, r.start_date, r.end_date));
}

function getBookedStatus(dateStr: string, ranges: BookedRange[]): string | null {
  const range = ranges.find((r) => isInRange(dateStr, r.start_date, r.end_date));
  return range ? range.status : null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AvailabilityCalendar({
  equipmentId,
  onDateRangeSelect,
  selectedStart,
  selectedEnd,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const today = toDateStr(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);
  const [localStart, setLocalStart] = useState<string>(selectedStart || '');
  const [localEnd, setLocalEnd] = useState<string>(selectedEnd || '');

  const fetchAvailability = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('equipment_availability')
        .select('start_date, end_date, status')
        .eq('equipment_id', equipmentId)
        .in('status', ['booked', 'blocked', 'maintenance']);

      if (!error && data) {
        setBookedRanges(data as BookedRange[]);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  useEffect(() => {
    if (selectedStart !== undefined) setLocalStart(selectedStart);
    if (selectedEnd !== undefined) setLocalEnd(selectedEnd);
  }, [selectedStart, selectedEnd]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleDayClick(dateStr: string) {
    if (readOnly) return;
    if (dateStr < today) return;
    if (isBooked(dateStr, bookedRanges)) return;

    if (selectingStart || (localStart && localEnd)) {
      setLocalStart(dateStr);
      setLocalEnd('');
      setSelectingStart(false);
    } else {
      if (dateStr < localStart) {
        setLocalStart(dateStr);
        setLocalEnd('');
        setSelectingStart(false);
        return;
      }
      // Check if any booked date falls in the range
      const rangeHasBooked = bookedRanges.some((r) => {
        return r.start_date <= dateStr && r.end_date >= localStart;
      });
      if (rangeHasBooked) {
        // Reset and start over
        setLocalStart(dateStr);
        setLocalEnd('');
        setSelectingStart(false);
        return;
      }
      setLocalEnd(dateStr);
      setSelectingStart(true);
      onDateRangeSelect?.(localStart, dateStr);
    }
  }

  function getDayClass(dateStr: string): string {
    const isPast = dateStr < today;
    const bookedStatus = getBookedStatus(dateStr, bookedRanges);
    const isToday = dateStr === today;
    const isSelStart = dateStr === localStart;
    const isSelEnd = dateStr === localEnd;
    const isInSel =
      localStart && localEnd && isInRange(dateStr, localStart, localEnd);
    const isInHover =
      !readOnly &&
      localStart &&
      !localEnd &&
      hoverDate &&
      hoverDate >= localStart &&
      isInRange(dateStr, localStart, hoverDate);

    let base =
      'relative flex items-center justify-center w-9 h-9 text-sm font-medium rounded-full transition-all select-none ';

    if (isSelStart || isSelEnd) {
      return base + 'bg-primary text-white font-bold shadow-md z-10';
    }
    if (isInSel) {
      return base + 'bg-primary/20 text-primary rounded-none';
    }
    if (isInHover) {
      return base + 'bg-primary/10 text-primary rounded-none';
    }
    if (bookedStatus === 'booked') {
      return base + 'bg-danger/15 text-danger line-through cursor-not-allowed';
    }
    if (bookedStatus === 'maintenance') {
      return base + 'bg-warning/15 text-warning line-through cursor-not-allowed';
    }
    if (bookedStatus === 'blocked') {
      return base + 'bg-muted text-muted-foreground line-through cursor-not-allowed';
    }
    if (isPast) {
      return base + 'text-muted-foreground/40 cursor-not-allowed';
    }
    if (isToday) {
      return base + 'border-2 border-primary text-primary font-bold cursor-pointer hover:bg-primary/10';
    }
    if (!readOnly) {
      return base + 'text-foreground cursor-pointer hover:bg-primary/10 hover:text-primary';
    }
    return base + 'text-foreground';
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push(dateStr);
  }

  const canGoPrev =
    currentYear > new Date().getFullYear() ||
    (currentYear === new Date().getFullYear() && currentMonth > new Date().getMonth());

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          📅 Availability Calendar
        </h3>
        {loading && (
          <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-foreground">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="flex items-center justify-center text-xs font-semibold text-muted-foreground h-8">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} className="w-9 h-9" />;
          }
          const day = parseInt(dateStr.split('-')[2], 10);
          return (
            <div
              key={dateStr}
              className="flex items-center justify-center"
              onMouseEnter={() => !readOnly && setHoverDate(dateStr)}
              onMouseLeave={() => !readOnly && setHoverDate(null)}
            >
              <button
                onClick={() => handleDayClick(dateStr)}
                className={getDayClass(dateStr)}
                title={
                  getBookedStatus(dateStr, bookedRanges) === 'booked' ?'Already booked'
                    : getBookedStatus(dateStr, bookedRanges) === 'maintenance' ?'Under maintenance'
                    : dateStr < today
                    ? 'Past date' :'Available'
                }
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <span className="text-xs text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <span className="text-xs text-muted-foreground">Maintenance</span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Selected</span>
          </div>
        )}
      </div>

      {/* Selection hint */}
      {!readOnly && (
        <div className="mt-3 flex items-start gap-2 bg-secondary/50 rounded-xl p-2.5">
          <Info size={13} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {!localStart
              ? 'Tap a date to select your rental start date'
              : !localEnd
              ? `Start: ${localStart} — Now tap your end date`
              : `Selected: ${localStart} → ${localEnd}`}
          </p>
        </div>
      )}
    </div>
  );
}
