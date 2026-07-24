import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useEvents } from "./UseEvents";
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

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [slotRange, setSlotRange] = useState<{ start: Date; end: Date } | null>(
    null,
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // untuk panel ringkasan harian

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

  // Klik tanggal kosong -> buka PANEL RINGKASAN HARIAN (bukan langsung modal tambah event)
  const handleSelectSlot = useCallback((slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
  }, []);

  // Klik event yang sudah ada -> langsung buka modal EDIT event itu
  const handleSelectEvent = useCallback((event: CalendarDisplayEvent) => {
    setEditingEvent(event.resource);
    setSlotRange(null);
    setIsEventModalOpen(true);
  }, []);

  // Dipanggil dari dalam panel ringkasan: tombol "+ Tambah Jadwal di Hari Ini"
  const handleAddEventFromPanel = () => {
    if (!selectedDate) return;
    setEditingEvent(null);
    setSlotRange({ start: selectedDate, end: selectedDate });
    setIsEventModalOpen(true);
  };

  // Dipanggil dari dalam panel ringkasan: klik salah satu event untuk edit
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
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
        modul)
      </p>

      <div
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        style={{ height: "600px" }}
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
