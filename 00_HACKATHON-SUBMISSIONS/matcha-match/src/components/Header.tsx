import { Leaf } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-matcha-medium to-matcha-dark shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <Leaf className="h-8 w-8 text-white" />
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Matcha Match
          </h1>
        </div>
        <p className="text-center text-matcha-light mt-2">
          Discover the perfect matcha experience near you
        </p>
      </div>
    </header>
  );
}