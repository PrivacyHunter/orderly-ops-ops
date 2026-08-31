import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    title: "My Favorites | Ambition Sports",
    meta: [
      { name: "description", content: "Your saved favorites from Ambition Sports." },
      { property: "og:title", content: "My Favorites | Ambition Sports" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: FavoritesPage,
});

// Reuse the products list from FeaturedProducts for simplicity in this demo environment
// In a real app, this would come from a database or shared utility
const allProducts = [
  { name: "Apex Pro Soccer Jersey", price: "Custom Quote", tag: "Hot", category: "Sportswear", image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1974&auto=format&fit=crop" },
  { name: "Hyper-Stretch Leggings", price: "Custom Quote", tag: "New", category: "Activewear", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1974&auto=format&fit=crop" },
  { name: "Stealth Basketball Kit", price: "Custom Quote", tag: "Trending", category: "Sportswear", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop" },
  { name: "Nebula Training Hoodie", price: "Custom Quote", tag: "Elite", category: "Activewear", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop" },
  { name: "Vector Compression", price: "Custom Quote", tag: "Sale", category: "Activewear", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" },
  { name: "Street Elite Hoodie", price: "Custom Quote", tag: "Limited", category: "Casual", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop" },
];

function FavoritesPage() {
  const [favoriteIndices, setFavoriteIndices] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Sync with the same storage key used in FeaturedProducts (if any) or shared state
    // For now, we'll read from localStorage if it exists
    const stored = localStorage.getItem("ambition_favorites");
    if (stored) {
      setFavoriteIndices(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  const favoriteProducts = allProducts.filter((_, idx) => favoriteIndices.includes(idx));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-transform">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              My <span className="text-primary">Favorites</span>
            </h1>
          </div>
          <div className="hidden md:block">
            <Heart size={48} className="text-primary opacity-20" />
          </div>
        </header>

        {!isLoaded ? (
          <div className="h-64 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteProducts.map((product, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 relative group"
              >
                <div className="h-[300px] overflow-hidden relative">
                   <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                   />
                   <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{product.tag}</span>
                   </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{product.category}</p>
                    <span className="text-slate-900 dark:text-white font-black text-sm">{product.price}</span>
                  </div>
                  <h4 className="font-black uppercase tracking-tighter text-xl mb-4 leading-tight">{product.name}</h4>
                  <Link to="/quote" className="w-full block text-center bg-primary text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300">
                    Request Quote
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-[3rem] border-dashed border-2 border-border">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-2xl font-black uppercase italic mb-2">No Favorites Yet</h3>
            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest mb-8">
              Items you heart in our collection will appear here.
            </p>
            <Link to="/" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all">
              Explore Collection
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
