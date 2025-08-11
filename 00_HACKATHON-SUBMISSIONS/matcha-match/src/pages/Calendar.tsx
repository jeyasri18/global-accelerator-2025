import { useNavigate } from "react-router-dom";

export default function CalendarPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Matcha Calendar</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Placeholder calendar page. Hook up your real calendar when ready.
      </p>

      <div className="border rounded-lg p-6">
        Coming soon…
      </div>

      <button
        onClick={() => navigate("/home")}
        className="mt-6 bg-matcha-medium hover:bg-matcha-dark text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        Back to Home
      </button>
    </div>
  );
}
