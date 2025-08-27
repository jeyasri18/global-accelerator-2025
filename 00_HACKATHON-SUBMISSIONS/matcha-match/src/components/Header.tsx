import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name:string}|null>(null);

  useEffect(() => {
    const u = localStorage.getItem("mm_user");
    setUser(u ? JSON.parse(u) : null);
  }, []);

  const signOut = () => {
    localStorage.removeItem("mm_user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="bg-primary/90 backdrop-blur-sm border-b border-background shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 items-center">
          <div />
          <h1 className="col-span-1 text-center text-3xl font-bold text-foreground tracking-wide flex flex-col items-center justify-center space-y-2">
            <img src={logo} alt="Matcha Match Logo" className="h-16 w-16" />
            <span className="font-cute text-foreground">Matcha Match</span>
          </h1>
          <div className="flex justify-end">
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut} className="text-accent bg-background hover:bg-background/80 border border-accent/30">
                <User className="h-4 w-4 mr-2" />
                {user.name || "Profile"} (Sign out)
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-accent bg-background hover:bg-background/80 border border-accent/30">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
        <p className="text-center text-foreground mt-1">Discover the perfect matcha experience near you</p>
      </div>
    </header>
  );
}
