import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import Header from "@/components/Header";
import { Trophy, Flame, Star, ChevronLeft, ChevronRight } from "lucide-react";
import matchaIcon from "@/assets/matcha.svg";

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
    <div className="min-h-screen bg-gradient-to-br from-appaccent via-appaccent/90 to-appprimary">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
                        <div className="text-center mb-12">
                  <h1 className="text-3xl font-cute font-bold mb-4 text-appbg/80 drop-shadow-lg">
                    Calendar
                  </h1>
                  <p className="text-lg text-appbg/80 mb-2 font-cute">
                    Click a day to mark as a Matcha day! Build your streak!
                  </p>
                  <div className="w-24 h-1 bg-appbg/60 rounded-full mx-auto"></div>
                </div>

        {/* Enhanced Calendar Container - Soft Green Background */}
        <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 rounded-3xl p-8 md:p-12 shadow-2xl border border-green-300/30">

          {/* Calendar Display - 3 Months */}
          <div className="w-full flex justify-center">
            <UICalendar
              className="w-full max-w-[1400px] [&_.rdp-table]:w-full [&_.rdp-tbody]:w-full [&_.rdp-tr]:w-full [&_.rdp-td]:w-full [&_.rdp-button]:w-full [&_.rdp-button]:h-20 [&_.rdp-button]:text-xl [&_.rdp-button]:font-medium [&_.rdp-button]:rounded-2xl [&_.rdp-button]:shadow-md [&_.rdp-button]:transition-all [&_.rdp-button]:hover:scale-105 [&_.rdp-button]:hover:shadow-lg [&_.rdp-button]:hover:bg-green-50 [&_.rdp-button]:focus:ring-4 [&_.rdp-button]:focus:ring-green-400/30 [&_.rdp-button]:focus:outline-none [&_.rdp-button]:border-2 [&_.rdp-button]:border-transparent [&_.rdp-button]:hover:border-green-400/30 [&_.rdp-caption]:text-3xl [&_.rdp-caption]:font-bold [&_.rdp-caption]:text-green-700 [&_.rdp-head_cell]:text-green-700 [&_.rdp-head_cell]:font-semibold [&_.rdp-head_cell]:text-lg [&_.rdp-head_cell]:pb-4 [&_.rdp-button]:hover:bg-gradient-to-br [&_.rdp-button]:hover:from-green-50 [&_.rdp-button]:hover:to-green-100"
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              numberOfMonths={3}
              pagedNavigation
              modifiers={{
                matcha: matchaDays.map(d => {
                  const [y, m, day] = d.split('-').map(Number);
                  return new Date(y, m - 1, day);
                }),
              }}
              modifiersClassNames={{
                matcha: "!bg-gradient-to-br !from-appbg !to-appaccent !text-white !font-bold !border-2 !border-appaccent !shadow-lg !relative !overflow-hidden",
              }}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  const dateStr = toLocalDateString(date);
                  const isMatchaDay = matchaDays.includes(dateStr);
                  
                  return (
                    <div className="relative w-full h-full">
                      <button
                        {...props}
                        className={`w-full h-full flex items-center justify-center relative ${
                          isMatchaDay 
                            ? 'bg-gradient-to-br from-appbg to-appaccent text-white font-bold border-2 border-appaccent shadow-lg' 
                            : 'hover:bg-green-50 hover:border-green-400/30 hover:shadow-lg'
                        } rounded-2xl transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-green-400/30 focus:outline-none border-2 border-transparent group`}
                      >
                        <span className="text-xl font-medium relative z-10">{date.getDate()}</span>
                        
                        {/* Glow Effect for Matcha Days - No more ugly image */}
                        {isMatchaDay && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-appbg/20 to-appaccent/20 blur-sm -z-10 group-hover:blur-md transition-all duration-300"></div>
                        )}
                        
                        {/* Hover Glow Effect for All Days */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/10 group-hover:to-green-600/10 transition-all duration-300 -z-20"></div>
                      </button>
                    </div>
                  );
                }
              }}
            />
          </div>

          {/* Enhanced Streak Indicators - Directly Under Calendar */}
          <div className="mt-12 flex justify-center">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Highest Streak */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-xl border-2 border-yellow-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-8 h-8 text-yellow-200" />
                    <div>
                      <div className="text-sm font-medium opacity-90">Highest Streak</div>
                      <div className="text-3xl font-black">{highestStreak}</div>
                      <div className="text-xs opacity-75">{highestStreak === 1 ? 'day' : 'days'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-xl border-2 border-red-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <Flame className="w-8 h-8 text-red-200" />
                    <div>
                      <div className="text-sm font-medium opacity-90">Current Streak</div>
                      <div className="text-3xl font-black">{currentStreak}</div>
                      <div className="text-xs opacity-75">{currentStreak === 1 ? 'day' : 'days'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Achievement */}
              {highestStreak >= 10 && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-400 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-xl border-2 border-purple-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center space-x-3">
                      <Star className="w-8 h-8 text-purple-200" />
                      <span className="text-xl font-black">✨ 10+ Day Streak! You are a Matcha Master! ✨</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/home")}
            className="bg-gradient-to-r from-appbg to-appaccent hover:from-appaccent hover:to-appbg text-white font-bold py-4 px-8 rounded-2xl shadow-xl border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
