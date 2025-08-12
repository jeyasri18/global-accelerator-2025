// import { Leaf, User } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";

// export default function Header() {
//   const navigate = useNavigate();

//   return (
//     <header className="bg-gradient-to-r from-matcha-medium to-matcha-dark shadow-lg">
//       <div className="container mx-auto px-4 py-6">
//         <div className="grid grid-cols-3 items-center">
//           <div></div>

//           <h1 className="col-span-1 text-center text-3xl font-bold text-white tracking-wide flex items-center justify-center space-x-3">
//             <Leaf className="h-8 w-8" />
//             <span>Matcha Match</span>
//           </h1>

//           <div className="flex justify-end">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => navigate("/auth")}
//               className="text-white hover:bg-white/20 border border-white/30"
//             >
//               <User className="h-4 w-4 mr-2" />
//               Sign In
//             </Button>
//           </div>
//         </div>

//         {/* Subtitle closer to the title */}
//         <p className="text-center text-matcha-light mt-1">
//           Discover the perfect matcha experience near you
//         </p>
//       </div>
//     </header>
//   );
// }
import { useEffect, useState } from "react";
import { Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
    <header className="bg-gradient-to-r from-matcha-medium to-matcha-dark shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 items-center">
          <div />
          <h1 className="col-span-1 text-center text-3xl font-bold text-white tracking-wide flex items-center justify-center space-x-3">
            <Leaf className="h-8 w-8" />
            <span>Matcha Match</span>
          </h1>
          <div className="flex justify-end">
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut} className="text-white hover:bg-white/20 border border-white/30">
                <User className="h-4 w-4 mr-2" />
                {user.name || "Profile"} (Sign out)
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-white hover:bg-white/20 border border-white/30">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
        <p className="text-center text-matcha-light mt-1">Discover the perfect matcha experience near you</p>
      </div>
    </header>
  );
}
