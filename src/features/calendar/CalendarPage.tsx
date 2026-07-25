import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useEvents } from "./UseEvents";
import { useExpenses } from "../expense/UseExpenses";
import { useExercises } from "../exercise/UseExercises";
import EventModal from "./EventModal";
import DaySummaryPanel from "./DaySummaryPanel";
import {
  EVENT_TIPE_COLOR,
  type CalendarEvent,
  type CalendarEventInput,
} from "../../types";

const locales = { id };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: id }),
  getDay,
  locales,
});

interface CalendarDisplayEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEvent;
}

// Format ringkas buat kotak kecil kalender: 50000 -> "50rb", 1500000 -> "1.5jt"
function formatRupiahSingkat(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 1_000) return `${Math.round(n / 1000)}rb`;
  return `${n}`;
}

function dateKey(d: Date) {
  return d.toDateString();
}

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { expenses } = useExpenses();
  const { exercises } = useExercises();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [slotRange, setSlotRange] = useState<{ start: Date; end: Date } | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const displayEvents: CalendarDisplayEvent[] = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.judul,
        start: new Date(e.tanggal_mulai),
        end: e.tanggal_selesai
          ? new Date(e.tanggal_selesai)
          : new Date(e.tanggal_mulai),
        resource: e,
      })),
    [events],
  );

  // Peta total pengeluaran per tanggal - dipakai buat preview di kotak kalender
  const expenseByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      const key = dateKey(new Date(e.tanggal));
      map[key] = (map[key] ?? 0) + e.nominal;
    }
    return map;
  }, [expenses]);

  // Peta "ada olahraga tidak" per tanggal - buat indikator titik kecil
  const exerciseDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const ex of exercises) set.add(dateKey(new Date(ex.tanggal)));
    return set;
  }, [exercises]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarDisplayEvent) => {
    setEditingEvent(event.resource);
    setSlotRange(null);
    setIsEventModalOpen(true);
  }, []);

  const handleAddEventFromPanel = () => {
    if (!selectedDate) return;
    setEditingEvent(null);
    setSlotRange({ start: selectedDate, end: selectedDate });
    setIsEventModalOpen(true);
  };

  const handleEditEventFromPanel = (eventId: string) => {
    const found = events.find((e) => e.id === eventId);
    if (found) {
      setEditingEvent(found);
      setSlotRange(null);
      setIsEventModalOpen(true);
    }
  };

  const handleSubmit = async (input: CalendarEventInput) => {
    if (editingEvent) return updateEvent(editingEvent.id, input);
    return addEvent(input);
  };

  const handleDelete = async () => {
    if (editingEvent && confirm("Yakin hapus jadwal ini?")) {
      await deleteEvent(editingEvent.id);
      setIsEventModalOpen(false);
    }
  };

  const eventPropGetter = useCallback((event: CalendarDisplayEvent) => {
    return {
      style: {
        backgroundColor: EVENT_TIPE_COLOR[event.resource.tipe],
        borderRadius: "6px",
        border: "none",
      },
    };
  }, []);

  // Custom render untuk header tiap kotak tanggal di tampilan Bulan:
  // nomor tanggal + preview pengeluaran (kalau ada) + titik indikator olahraga
  const CustomDateHeader = useCallback(
    ({ date: cellDate, label }: { date: Date; label: string }) => {
      const key = dateKey(cellDate);
      const totalExpense = expenseByDate[key];
      const hasExercise = exerciseDateSet.has(key);

      return (
        <div className="flex flex-col items-end px-1 pt-1 gap-0.5">
          <div className="flex items-center gap-1">
            {hasExercise && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-orange-400"
                title="Ada olahraga"
              />
            )}
            <span>{label}</span>
          </div>
          {totalExpense && (
            <span className="text-[10px] font-medium text-red-500 dark:text-red-400 leading-none">
              -{formatRupiahSingkat(totalExpense)}
            </span>
          )}
        </div>
      );
    },
    [expenseByDate, exerciseDateSet],
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Calendar
        </h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setSlotRange({ start: new Date(), end: new Date() });
            setIsEventModalOpen(true);
          }}
          className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          + Tambah Jadwal
        </button>
      </div>

      <p className="text-xs text-gray-400 -mt-2">
        💡 Klik tanggal manapun untuk lihat ringkasan aktivitas hari itu (semua
        modul). Pengeluaran & olahraga sudah muncul preview langsung di kotak
        tanggal.
      </p>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        style={{ height: "650px" }}
      >
        <Calendar
          localizer={localizer}
          events={displayEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          components={{ month: { dateHeader: CustomDateHeader } }}
          culture="id"
          messages={{
            next: "Selanjutnya",
            previous: "Sebelumnya",
            today: "Hari ini",
            month: "Bulan",
            week: "Minggu",
            day: "Hari",
            agenda: "Agenda",
            noEventsInRange: "Tidak ada jadwal di rentang ini.",
          }}
        />
      </div>

      {selectedDate && (
        <DaySummaryPanel
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onAddEvent={handleAddEventFromPanel}
          onEditEvent={handleEditEventFromPanel}
        />
      )}

      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSubmit={handleSubmit}
          onDelete={editingEvent ? handleDelete : undefined}
          editingEvent={editingEvent}
          defaultStart={slotRange?.start}
          defaultEnd={slotRange?.end}
        />
      )}
    </div>
  );
}
