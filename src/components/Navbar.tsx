import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, Mail, Heart, ChevronDown, Search } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ROUTES, subcategoriesFor, type CategoryKey } from "@/lib/catalog";
import { listSettings } from "@/lib/admin.functions";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { branding } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setIsMobileMenuOpen(false);
    void navigate({ to: "/search", search: { q: term } });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    { name: "Customization", href: "/customization" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    ...(siteMode === "store" ? [{ name: "Track Order", href: "/track" }] : []),
  ];

  const categoryMenus = (["sportswear", "activewear", "casualwear"] as CategoryKey[]).map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    href: CATEGORY_ROUTES[key],
    subs: subcategoriesFor(key),
  }));


  return (
    <>
      {/* Notification Bar */}
      {branding.showNotificationBar && (
        <div className="bg-primary py-1 px-4 text-center text-xs font-bold text-primary-foreground uppercase tracking-wider">
          {branding.notificationText}
        </div>
      )}

      {/* Top Info Bar */}
      {branding.showTopInfoBar && (
        <div className="hidden lg:flex justify-between items-center px-8 py-2 text-xs text-foreground border-b-2 border-primary bg-background">
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
              {social?.threads && <a href={social.threads} target="_blank" rel="noopener noreferrer" aria-label="Threads" className="text-muted-foreground hover:text-primary transition-colors"><FaThreads size={16} /></a>}
            </div>
          )}
        </div>
      )}

      <nav
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border bg-background text-foreground transition-all duration-300 px-4 lg:px-8 py-4",
          isScrolled 
            ? "py-3 shadow-sm" 
            : "shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 group mr-2 xl:mr-4">

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
          <div className="hidden lg:flex min-w-0 items-center gap-3 xl:gap-5">
            <Link
              to="/"
              className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            {categoryMenus.map((menu) => (
              <div key={menu.key} className="relative group/menu">
                <Link
                  to={menu.href}
                  className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                  activeProps={{ className: "text-primary" }}
                >
                  {menu.label}
                  <ChevronDown size={14} className="transition-transform group-hover/menu:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-3 opacity-0 transition-all group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    {menu.subs.map((sub) => (
                      <Link
                        key={sub.slug}
                        to={menu.href}
                        search={{ sub: sub.slug }}
                        className="block border-b border-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-surface hover:text-primary"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link
                      to={menu.href}
                      search={{ sub: "all" }}
                      className="block px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-primary transition-colors hover:bg-surface"
                    >
                      All Products
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/quote"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded font-black text-sm uppercase transition-all hover:scale-105"
              
            >
              Get a Quote
            </Link>
            <form onSubmit={submitSearch} className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search products"
                className="w-36 rounded-full border border-border bg-card py-2 pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:w-52 focus:border-primary transition-all"
              />
            </form>
            <Link
              to="/favorites"
              className="p-2 hover:bg-surface rounded-full transition-colors text-muted-foreground hover:text-primary relative group"
              title="My Favorites"
            >
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-surface"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 max-h-[80vh] w-full overflow-y-auto bg-background text-foreground border-b border-border p-5 flex flex-col shadow-lg animate-in slide-in-from-top duration-300">
            <form onSubmit={submitSearch} className="relative mb-4">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search products"
                className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </form>

            <Link
              to="/"
              className="border-b border-border py-3.5 text-sm font-bold uppercase tracking-widest hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            {categoryMenus.map((menu) => {
              const isOpen = openGroup === menu.key;
              return (
                <div key={menu.key} className="border-b border-border">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenGroup(isOpen ? null : menu.key)}
                    className="flex w-full items-center justify-between py-3.5 text-sm font-bold uppercase tracking-widest hover:text-primary"
                  >
                    {menu.label}
                    <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col pb-3">
                      <Link
                        to={menu.href}
                        search={{ sub: "all" }}
                        className="py-2 pl-3 text-xs font-bold capitalize tracking-wide text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        All {menu.label}
                      </Link>
                      {menu.subs.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={menu.href}
                          search={{ sub: sub.slug }}
                          className="py-2 pl-3 text-xs font-semibold capitalize tracking-wide text-muted-foreground hover:text-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="border-b border-border py-3.5 text-sm font-bold uppercase tracking-widest hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/favorites"
              className="flex items-center gap-3 border-b border-border py-3.5 text-sm font-bold uppercase tracking-widest hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Heart size={16} /> Favorites
            </Link>
            <Link
              to="/quote"
              className="mt-4 rounded-xl bg-primary px-6 py-3.5 text-center text-sm font-black uppercase text-primary-foreground"
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
