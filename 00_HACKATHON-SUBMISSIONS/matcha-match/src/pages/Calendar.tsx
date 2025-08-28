import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar as UICalendar } from "@/components/ui/calendar";

// Simulate matcha days with localStorage (or use mock data)
function getMatchaDays() {
  const data = localStorage.getItem("matcha_days");
  if (data) return JSON.parse(data);
  return [];
}
function setMatchaDay(dateStr: string) {
  const days = getMatchaDays();
  if (!days.includes(dateStr)) {
    days.push(dateStr);
    localStorage.setItem("matcha_days", JSON.stringify(days));
  }
}
function getStreak(days: string[]) {
  // Sort and count consecutive days
  const sorted = days.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  let maxStreak = 0, currentStreak = 0, prev: Date | null = null;
  for (const d of sorted) {
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    prev = d;
  }
  return maxStreak;
}
function toLocalDateString(date: Date) {
  // Returns YYYY-MM-DD in local time, not UTC
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getCurrentStreak(days: string[]) {
  // Returns the current streak up to today
  if (!days.length) return 0;
  const sorted = days.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  let streak = 0;
  let prev = null;
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (!prev) {
      // Start from today or yesterday
      const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 0 || diff === 1) {
        streak = 1;
        prev = d;
      } else {
        break;
      }
    } else {
      const diff = (prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        prev = d;
      } else {
        break;
      }
    }
  }
  return streak;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [matchaDays, setMatchaDays] = useState<string[]>(getMatchaDays());
  const highestStreak = getStreak(matchaDays);
  const currentStreak = getCurrentStreak(matchaDays);

  useEffect(() => {
    setMatchaDays(getMatchaDays());
  }, []);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const dateStr = toLocalDateString(date);
    setMatchaDay(dateStr);
    setMatchaDays(getMatchaDays());
    setSelected(date);
  }

  // Ensure the selected date is always one of the matcha days if just clicked
  useEffect(() => {
    if (selected) {
      const dateStr = toLocalDateString(selected);
      if (!matchaDays.includes(dateStr)) {
        setSelected(undefined);
      }
    }
  }, [matchaDays]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-appaccent">
      <h1 className="text-3xl font-cute font-bold mb-3 text-appbg text-center">Matcha Calendar</h1>
      <p className="text-lg text-appbg mb-8 font-cute text-center">
        Click a day to mark as a Matcha day! Build your streak!
      </p>
      <div className="border rounded-xl p-8 md:p-10 bg-appprimary/95 shadow-sm">
        <div className="w-full flex justify-center">
          <UICalendar
            className="w-full max-w-[1100px]"
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={2}
          pagedNavigation
          modifiers={{
            matcha: matchaDays.map(d => {
              const [y, m, day] = d.split('-').map(Number);
              return new Date(y, m - 1, day);
            }),
          }}
          modifiersClassNames={{
            matcha: "bg-appbg text-appaccent font-extrabold border-2 border-appaccent",
          }}
          />
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="font-cute text-xl text-appaccent flex justify-center sm:justify-start">
            <span className="px-4 py-2 rounded-full bg-appbg text-appaccent font-extrabold shadow border-2 border-appaccent inline-flex items-center">
              🏆 Highest Streak: <span className="ml-2 text-2xl font-black text-appaccent">{highestStreak}</span> {highestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="font-cute text-lg text-appbg flex justify-center sm:justify-end">
            <span className="px-4 py-2 rounded-full bg-appaccent text-appbg font-bold shadow border-2 border-appbg inline-flex items-center">
              🔥 Current Streak: <span className="ml-2 text-xl font-black text-appbg">{currentStreak}</span> {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          {highestStreak >= 10 && (
            <span className="sm:col-span-2 text-center mt-2 px-4 py-2 rounded-full bg-appbg text-appaccent font-black text-lg border-2 border-appaccent">✨ 10+ Day Streak! You are a Matcha Master! ✨</span>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate("/home")}
        className="mt-8 bg-appbg hover:bg-appprimary text-appaccent font-semibold py-2 px-5 rounded-lg transition font-cute"
      >
        Back to Home
      </button>
    </div>
  );
}
