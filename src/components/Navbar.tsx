import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, Mail, Heart, ChevronDown, Search } from "lucide-react";
import { categoryLinkProps, liveCategories, isHotItem } from "@/lib/catalog";
import { getCatalogTaxonomy } from "@/lib/catalog.functions";
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
import { Button } from "@/components/ui/button";

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
      try {
        const settings = await listSettings();
        setSiteMode(settings?.["site_mode"] === "store" ? "store" : "business");
      } catch {
        setSiteMode("business");
      }
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

  const loadCatalog = useServerFn(getCatalogTaxonomy);
  const { data: catalog } = useQuery({ queryKey: ["catalog-taxonomy"], queryFn: () => loadCatalog() });
  const allCategories = liveCategories(catalog);
  const hotCategories = allCategories.filter((cat) => isHotItem(cat.slug));
  const categoryMenus = allCategories.filter((cat) => !isHotItem(cat.slug)).map((cat) => ({
    key: cat.slug,
    label: cat.name,
    linkProps: categoryLinkProps(cat.slug) as any,
    subLink: (sub: string) => categoryLinkProps(cat.slug, sub) as any,
    subs: cat.subcategories.filter((s) => s.enabled),
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
          "sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 text-foreground backdrop-blur-xl transition-shadow duration-300",
          isScrolled 
            ? "shadow-lg" 
            : "shadow-sm"
        )}
      >
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="Ambition Sports home">

            {branding.logoUrl ? (
              <span className="inline-flex items-center justify-center rounded-lg border-2 border-primary bg-white p-1 shadow-sm transition-all group-hover:shadow-md sm:rounded-xl sm:p-1.5">
                <img
                  src={branding.logoUrl}
                  alt={branding.logoText}
                  width={128}
                  height={48}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-8 w-auto max-w-20 object-contain min-[380px]:max-w-24 sm:h-10 sm:max-w-28"
                />
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
          <div className="hidden min-w-0 flex-1 items-center justify-end xl:flex">
            <div className="flex min-w-0 items-center gap-6">
            <Link
              to="/"
              className="relative whitespace-nowrap py-2 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:text-foreground"
              activeProps={{ className: "text-foreground after:scale-x-100" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            {categoryMenus.map((menu) => (
              <div key={menu.key} className="relative group/menu">
                <Link
                  {...menu.linkProps}
                  className="relative flex items-center gap-1 whitespace-nowrap py-2 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:text-foreground"
                  activeProps={{ className: "text-foreground after:scale-x-100" }}
                >
                  {menu.label}
                  <ChevronDown size={14} className="transition-transform group-hover/menu:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-3 opacity-0 transition-all group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    {menu.subs.map((sub) => (
                      <Link
                        key={sub.slug}
                        {...menu.subLink(sub.slug)}
                        className="block border-b border-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-surface hover:text-primary"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    <Link
                      {...menu.subLink("all")}
                      className="block px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-primary transition-colors hover:bg-surface"
                    >
                      All Products
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {hotCategories.length > 0 && (
              <div className="relative group/menu">
                <button
                  type="button"
                  className="relative flex items-center gap-1 whitespace-nowrap py-2 text-sm font-medium text-primary transition-colors"
                >
                  Hot Items
                  <ChevronDown size={14} className="transition-transform group-hover/menu:rotate-180" />
                </button>
                <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-3 opacity-0 transition-all group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    {hotCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        {...(categoryLinkProps(cat.slug) as any)}
                        className="block border-b border-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors last:border-b-0 hover:bg-surface hover:text-primary"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="relative whitespace-nowrap py-2 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:text-foreground"
                activeProps={{ className: "text-foreground after:scale-x-100" }}
              >
                {link.name}
              </Link>
            ))}
            </div>
            <div className="ml-5 flex shrink-0 items-center gap-4 border-l border-foreground/10 pl-5">
            <Button asChild className="h-auto rounded-lg px-5 py-2.5 text-sm font-semibold shadow-none transition-colors">
              <Link to="/quote">Get a Quote</Link>
            </Button>
            <form onSubmit={submitSearch} className="relative hidden min-[1360px]:block">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search products"
                className="h-9 w-32 rounded-lg border border-foreground/10 bg-foreground/5 py-2 pl-9 pr-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:w-40 focus:border-primary/70 focus:bg-foreground/10 focus:ring-1 focus:ring-primary/30"
              />
            </form>
            <Link
              to="/favorites"
              className="group relative grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary"
              title="My Favorites"
            >
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <ThemeToggle />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 min-[380px]:gap-2 sm:gap-3 xl:hidden">
            <Link to="/search" aria-label="Search products" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary">
              <Search size={19} />
            </Link>
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="rounded-lg text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 top-full flex max-h-[80vh] w-full flex-col overflow-y-auto border-b border-foreground/10 bg-background/98 p-5 text-foreground shadow-lg backdrop-blur-xl animate-in slide-in-from-top duration-300 xl:hidden">
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
              className="border-b border-border py-3.5 text-sm font-medium hover:text-primary"
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
                    className="flex w-full items-center justify-between py-3.5 text-sm font-medium hover:text-primary"
                  >
                    {menu.label}
                    <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col pb-3">
                      <Link
                        {...menu.subLink("all")}
                        className="py-2 pl-3 text-xs font-bold capitalize tracking-wide text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        All {menu.label}
                      </Link>
                      {menu.subs.map((sub) => (
                        <Link
                          key={sub.slug}
                          {...menu.subLink(sub.slug)}
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
            {hotCategories.length > 0 && (
              <div className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={openGroup === "hot-items"}
                  onClick={() => setOpenGroup(openGroup === "hot-items" ? null : "hot-items")}
                  className="flex w-full items-center justify-between py-3.5 text-sm font-medium text-primary"
                >
                  Hot Items
                  <ChevronDown size={16} className={cn("transition-transform", openGroup === "hot-items" && "rotate-180")} />
                </button>
                {openGroup === "hot-items" && (
                  <div className="flex flex-col pb-3">
                    {hotCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        {...(categoryLinkProps(cat.slug) as any)}
                        className="py-2 pl-3 text-xs font-semibold capitalize tracking-wide text-muted-foreground hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="border-b border-border py-3.5 text-sm font-medium hover:text-primary"
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
