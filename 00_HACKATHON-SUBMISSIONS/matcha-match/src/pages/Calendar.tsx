// src/pages/CalendarPage.tsx
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [matchaLog, setMatchaLog] = useState<{ [key: string]: boolean }>({});

  const handleDayClick = (value: Date) => {
    const dateKey = value.toDateString();
    setMatchaLog(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey], // toggle matcha day
    }));
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">📅 My Matcha Calendar</h1>
      <Calendar
        onClickDay={handleDayClick}
        value={date}
        tileClassName={({ date }) =>
          matchaLog[date.toDateString()] ? "bg-green-300 rounded-full" : ""
        }
      />
      <p className="mt-4 text-gray-600">
        Click a day to mark if you had matcha. Green days = matcha days!
      </p>
    </div>
  );
}
