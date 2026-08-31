import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, Mail, Moon, Sun, Heart } from "lucide-react";
import { listSettings } from "@/lib/admin.functions";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa";

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export function Navbar() {
  const { branding, mode, toggleMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { savedTheme } = useTheme();
  const [siteMode, setSiteMode] = useState<"business" | "store">("business");

  useEffect(() => {
    // Check site mode from settings if possible, otherwise default
    // In a real app we'd query this or get it from ThemeContext
    const fetchMode = async () => {
      const settings = await listSettings();
      if (settings["site_mode"] === "store") setSiteMode("store");
      else setSiteMode("business");
    };
    fetchMode();
  }, []);

  const loadBlocks = useServerFn(getSiteBlocks);
  const { data: blocks } = useQuery({ queryKey: ["site-blocks"], queryFn: () => loadBlocks() });
  const social = blocks?.social;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Sportswear", href: "/sportswear" },
    { name: "Activewear", href: "/activewear" },
    { name: "Customization", href: "/customization" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    ...(siteMode === "store" ? [{ name: "Track Order", href: "/track" }] : []),
  ];


  return (
    <>
      {/* Notification Bar */}
      {branding.showNotificationBar && (
        <div className="bg-neon-lime py-1 px-4 text-center text-xs font-bold text-background uppercase tracking-wider">
          {branding.notificationText}
        </div>
      )}

      {/* Top Info Bar */}
      {branding.showTopInfoBar && (
        <div className="hidden lg:flex justify-between items-center px-8 py-2 text-xs border-b-2 border-primary bg-background/50 backdrop-blur-md">
          <div className="flex gap-6">
            <a href={`tel:${branding.phone}`} className="flex items-center gap-2 hover:text-neon-cyan transition-colors">
              <Phone size={14} className="text-neon-cyan" /> {branding.phone}
            </a>
            <a href={`mailto:${branding.email}`} className="flex items-center gap-2 hover:text-neon-cyan transition-colors">
              <Mail size={14} className="text-neon-cyan" /> {branding.email}
            </a>
          </div>
          {branding.showSocialIcons && (
            <div className="flex gap-4">
              {social?.whatsapp && <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaWhatsapp size={16} /></a>}
              {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaFacebook size={16} /></a>}
              {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaInstagram size={16} /></a>}
              {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaTwitter size={16} /></a>}
              {social?.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaLinkedin size={16} /></a>}
            </div>
          )}
        </div>
      )}

      <nav
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 px-4 lg:px-8 py-4",
          isScrolled 
            ? "bg-background border-b border-border py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
            : "bg-background shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            {branding.logoUrl ? (
              <span className="inline-flex items-center justify-center p-1.5 rounded-xl border-2 border-primary bg-white">
                <img src={branding.logoUrl} alt={branding.logoText} className="h-8 md:h-10 w-auto object-contain" />
              </span>
            ) : (
              <>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-primary-foreground text-2xl group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all">
                  {branding.logoText?.[0] || 'A'}
                </div>
                <span className="text-xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                  {branding.logoText.split(' ')[0]} <span className="text-primary">{branding.logoText.split(' ').slice(1).join(' ')}</span>
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-bold uppercase tracking-widest text-nav-foreground lg:text-foreground dark:lg:text-foreground hover:text-primary transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/quote"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded font-black text-sm uppercase transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(211,26,35,0.3)]"
              
            >
              Get a Quote
            </Link>
            <Link
              to="/favorites"
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-nav-foreground lg:text-muted-foreground hover:text-primary relative group"
              title="My Favorites"
            >
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <button 
              onClick={toggleMode}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-nav-foreground lg:text-muted-foreground hover:text-primary"
            >
              {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>


          <button
            className="lg:hidden text-nav-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-bold uppercase tracking-widest hover:text-neon-cyan"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/favorites"
              className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Heart size={18} /> Favorites
            </Link>
            <Link
              to="/quote"
              className="bg-primary text-white px-6 py-3 rounded text-center font-black uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
