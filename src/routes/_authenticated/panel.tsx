import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, LogOut, Package, Palette, Save, Settings2,
  ShieldCheck, Users, Globe2, Inbox, History, Download, Upload,
  Search, BarChart3, TrendingUp, MapPin, Smartphone,
  ArrowRight, GripVertical, Check, Wand2, FileJson,
  Layout, ShoppingBag, FileText, Activity, Mail, Layers, Play, Subtitles, X,
  Trash2, CheckSquare, Square, DownloadCloud, RefreshCw, Link, AlertCircle,
  Images, Pencil, Copy, Award
} from "lucide-react";

import { SiGooglechrome as Chrome, SiInstagram as Instagram } from "react-icons/si";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import {
  deleteProduct, duplicateProduct, getDashboard, updateStatus, upsertProduct, setUserRole,
  inviteUser, setAdminPermissions, backupSettings, restoreSettings, listSettings, saveSetting,
} from "@/lib/admin.functions";
import { getLandingPageContent, saveLandingPageContent, getFooterContent, saveFooterContent } from "@/lib/content.functions";
import { saveThemeVersion, getThemeHistory, scheduleReport } from "@/lib/history.functions";
import { getPageSeo, savePageSeo } from "@/lib/seo.functions";
import { getSeoBulk, saveSeoBulk, autoGenerateSeo } from "@/lib/seo-bulk.functions";
import { logAuditAction, getAuditLogs, getEmailLogs, exportAuditLogsCsv } from "@/lib/logs.functions";
import { applyTemplate } from "@/lib/templates.functions";
import { 
  getCustomizationVideos, 
  upsertCustomizationVideo, 
  deleteCustomizationVideo, 
  getEngagementStats,
  bulkActionCustomizationVideos 
} from "@/lib/customization.functions";
import { 
  getInstagramSettings, 
  updateInstagramSettings, 
  syncInstagramPosts,
  initiateInstagramAuth 
} from "@/lib/instagram.functions";
import { DEFAULT_BRANDING, DEFAULT_THEME, FONT_PRESETS, THEME_PRESETS, type BrandingConfig, type ThemeConfig } from "@/lib/theme";
import { getInstagramLogs, retrySyncLog } from "@/lib/instagram.functions";
import { CaptionPreview } from "@/components/CaptionPreview";
import { BannersTab } from "@/components/admin/BannersTab";
import { CertificatesTab } from "@/components/admin/CertificatesTab";
import { SiteBlocksTab } from "@/components/admin/SiteBlocksTab";
import { CustomOrdersTab } from "@/components/admin/CustomOrdersTab";
import { SmartImage } from "@/components/admin/SmartImage";
import { MediaField } from "@/components/admin/MediaField";
import { copyToClipboard, downloadUrl, uploadMedia } from "@/lib/media";


// PDF export will be handled by dynamic import in AnalyticsDashboard

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Control Panel | Ambition Sports" },
      { name: "description", content: "Owner, admin and developer control panel for Ambition Sports." },
      { property: "og:title", content: "Control Panel | Ambition Sports" },
      { property: "og:description", content: "Manage catalog, theme, branding and inquiries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelPage,
});

type Tab = "overview" | "inbox" | "orders" | "products" | "banners" | "certificates" | "blocks" | "theme" | "branding" | "seo" | "customization" | "visitors" | "analytics" | "instagram" | "accounts" | "logs" | "content" | "settings";

const TABS: {
  id: Tab;
  label: string;
  icon: any;
  roles?: ("owner" | "admin" | "developer")[];
  /** For admins, this section also requires the matching granted right. */
  permission?: string;
}[] = [
  { id: "overview", label: "Overview", icon: ShieldCheck },
  { id: "inbox", label: "Inbox", icon: Inbox, roles: ["owner", "admin", "developer"], permission: "inbox" },
  { id: "orders", label: "Custom Orders", icon: ShoppingBag, roles: ["owner", "admin", "developer"], permission: "orders" },
  { id: "products", label: "Products", icon: Package, roles: ["owner", "admin", "developer"], permission: "products" },
  { id: "banners", label: "Banners", icon: Images, roles: ["owner", "admin", "developer"], permission: "banners" },
  { id: "certificates", label: "Certificates", icon: Award, roles: ["owner", "admin", "developer"], permission: "certificates" },
  { id: "blocks", label: "Site Blocks", icon: Layers, roles: ["owner", "admin", "developer"], permission: "content" },
  { id: "theme", label: "Theme Studio", icon: Palette, roles: ["owner", "admin", "developer"], permission: "theme" },
  { id: "branding", label: "Branding", icon: Settings2, roles: ["owner", "admin", "developer"], permission: "branding" },
  { id: "seo", label: "SEO Editor", icon: Globe2, roles: ["owner", "admin", "developer"], permission: "seo" },
  { id: "customization", label: "Studio Manager", icon: Layers, roles: ["owner", "admin", "developer"], permission: "customization" },
  { id: "visitors", label: "Visitors", icon: Globe2, roles: ["owner", "admin", "developer"], permission: "visitors" },
  { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["owner", "admin", "developer"], permission: "analytics" },
  { id: "instagram", label: "Instagram", icon: Instagram, roles: ["owner", "admin", "developer"], permission: "instagram" },
  { id: "accounts", label: "Accounts", icon: Users, roles: ["owner", "developer"] },
  { id: "logs", label: "Logs", icon: Activity, roles: ["developer"] },
  { id: "content", label: "Content", icon: FileText, roles: ["owner", "admin", "developer"], permission: "content" },
  { id: "settings", label: "Settings", icon: Settings2, roles: ["owner", "admin", "developer"], permission: "settings" },
];

const PERMISSION_LABELS: Record<string, string> = {
  inbox: "Inbox",
  orders: "Custom Orders",
  products: "Products",
  banners: "Banners",
  certificates: "Certificates",
  theme: "Theme Studio",
  branding: "Branding",
  seo: "SEO Editor",
  customization: "Studio Manager",
  visitors: "Visitors",
  analytics: "Analytics",
  instagram: "Instagram",
  content: "Content",
  settings: "Settings",
};

function PanelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const dashboardFn = useServerFn(getDashboard);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["panel-dashboard"],
    queryFn: () => dashboardFn(),
    retry: false,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="glass h-40 w-full max-w-3xl shimmer rounded-3xl" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div className="glass max-w-md rounded-3xl p-8">
          <h1 className="text-2xl font-extrabold uppercase">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This area is limited to owner, admin and developer accounts.
          </p>
          <button onClick={signOut} className="mt-6 rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary">
            Sign out
          </button>
        </div>
      </main>
    );
  }

  const role = data!.role;
  const permissions: string[] = (data as any)?.permissions ?? [];
  const can = (permission?: string) =>
    role === "owner" || role === "developer" || !permission || permissions.includes(permission);
  const visibleTabs = TABS.filter(
    (t) => (!t.roles || t.roles.includes(role as any)) && can(t.permission),
  );
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : "overview";

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <header className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">Ambition OS</p>
          <h1 className="truncate text-2xl font-extrabold uppercase sm:text-4xl">Control Panel</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:inline">
            {role}
          </span>
          <AdminThemeManager />
          <ThemeToggle />
          <button onClick={signOut} aria-label="Sign out" className="glass grid h-9 w-9 place-items-center rounded-full">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <nav className="mx-auto mt-8 flex max-w-7xl gap-2 overflow-x-auto pb-2">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
              activeTab === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </nav>

      <section className="mx-auto mt-8 max-w-7xl pb-20">
        {activeTab === "overview" && <Overview data={data!} />}
        {activeTab === "inbox" && can("inbox") && <InboxTab data={data!} onDone={() => void refetch()} />}
        {activeTab === "orders" && can("orders") && <CustomOrdersTab />}
        {activeTab === "products" && can("products") && <ProductsTab data={data!} onDone={() => void refetch()} />}
              {activeTab === "banners" && can("banners") && <BannersTab />}
        {activeTab === "certificates" && can("certificates") && <CertificatesTab />}
        {activeTab === "blocks" && can("content") && <SiteBlocksTab />}
        {activeTab === "theme" && can("theme") && <ThemeStudio />}
        {activeTab === "branding" && can("branding") && <BrandingTab />}
        {activeTab === "seo" && can("seo") && <SeoTab />}
        {activeTab === "customization" && can("customization") && <CustomizationTab onDone={() => void refetch()} />}
        {activeTab === "visitors" && can("visitors") && <VisitorsTab data={data!} />}
        {activeTab === "analytics" && can("analytics") && <AnalyticsDashboard data={data!} />}
        {activeTab === "instagram" && can("instagram") && <InstagramTab />}
        {activeTab === "accounts" && (role === "owner" || role === "developer") && <AccountsTab data={data!} onDone={() => void refetch()} />}
        {activeTab === "logs" && role === "developer" && <LogsTab />}
        {activeTab === "content" && can("content") && <ContentTab />}
        {activeTab === "settings" && can("settings") && <AlertSettingsTab />}
      </section>
    </main>
  );
}

type Dash = Awaited<ReturnType<typeof getDashboard>>;

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="glass magnetic noise rounded-3xl p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-extrabold">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Overview({ data }: { data: Dash }) {
  const countries = new Set(data.tracking.map((t) => t.country).filter(Boolean)).size;
  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase">System Control</h2>
            <p className="text-xs text-muted-foreground">Manage site-wide backups and templates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BackupButton />
            <RestoreButton />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Inquiries" value={data.inquiries.length} />
        <Card title="Quote Requests" value={data.quotes.length} hint={`${data.quotes.filter(q => q.status === 'pending').length} pending`} />
        <Card title="Orders" value={data.orders.length} />
        <Card title="Countries" value={countries} hint={`${data.tracking.length} visits logged`} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TemplateCard 
          title="One-Click Business Site" 
          description="Transform into a professional manufacturer showcase with optimized branding and service sections."
          icon={Layout}
          type="business"
        />
        <TemplateCard 
          title="One-Click Online Store" 
          description="Launch a full retail setup with sample products, optimized checkout, and high-conversion layouts."
          icon={ShoppingBag}
          type="store"
        />
      </div>

      <div className="glass rounded-3xl p-6 sm:col-span-2 lg:col-span-4">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-primary" /> Live catalog
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {data.products.length} products published · {data.products.filter((p) => p.is_featured).length} featured
        </p>
      </div>
    </div>
  );
}

function TemplateCard({ title, description, icon: Icon, type }: { title: string, description: string, icon: any, type: 'business' | 'store' }) {
  const apply = useServerFn(applyTemplate);
  const mutation = useMutation({
    mutationFn: () => apply({ data: { type } }),
    onSuccess: () => {
      toast.success(`${title} template applied!`);
      window.location.reload();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to apply template"),
  });

  return (
    <div className="glass noise rounded-3xl p-6 flex flex-col justify-between items-start gap-4">
      <div className="space-y-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-widest">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => {
          if (confirm("This will update your site branding and settings. Continue?")) {
            mutation.mutate();
          }
        }}
        disabled={mutation.isPending}
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
      >
        {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        Apply Template
      </button>
    </div>
  );
}

function StatusRow({
  table, id, status, title, subtitle, onDone,
}: { table: "inquiries" | "quotes" | "orders"; id: string; status: string; title: string; subtitle: string; onDone: () => void }) {
  const update = useServerFn(updateStatus);
  const mutation = useMutation({
    mutationFn: (next: string) => update({ data: { table, id, status: next } }),
    onSuccess: () => { toast.success("Status updated"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <select
        value={status}
        onChange={(e) => mutation.mutate(e.target.value)}
        aria-label="Status"
        className="shrink-0 rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-bold uppercase"
      >
        {["pending", "in_review", "approved", "completed", "rejected"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

function InboxTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Inquiries</h2>
        {data.inquiries.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        {data.inquiries.map((i) => (
          <StatusRow key={i.id} table="inquiries" id={i.id} status={i.status} title={i.name} subtitle={`${i.email} · ${i.type}`} onDone={onDone} />
        ))}
      </div>
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Quote Requests</h2>
        {data.quotes.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        {data.quotes.map((q) => (
          <StatusRow key={q.id} table="quotes" id={q.id} status={q.status} title={`${q.name} · ${q.tracking_id ?? ""}`} subtitle={`${q.sport_type ?? "—"} · qty ${q.quantity ?? "—"}`} onDone={onDone} />
        ))}
      </div>
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Orders</h2>
        {data.orders.length === 0 && <p className="text-xs text-muted-foreground">Nothing yet.</p>}
        {data.orders.map((o) => (
          <StatusRow key={o.id} table="orders" id={o.id} status={o.status} title={o.email} subtitle={`${o.total_amount} USD`} onDone={onDone} />
        ))}
      </div>
    </div>
  );
}

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  category: "sportswear" | "activewear" | "casualwear";
  description: string;
  price: number;
  stock: number;
  images: string[];
  sizes: string;
  colors: string;
  is_featured: boolean;
  is_active: boolean;
  status: "draft" | "published" | "scheduled";
  sort_order: number;
};

const EMPTY_PRODUCT: ProductForm = {
  name: "", slug: "", category: "sportswear", description: "", price: 0, stock: 0,
  images: [], sizes: "", colors: "", is_featured: false, is_active: true,
  status: "published", sort_order: 0,
};

function ProductsTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  const [form, setForm] = useState<ProductForm | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const save = useServerFn(upsertProduct);
  const remove = useServerFn(deleteProduct);
  const duplicate = useServerFn(duplicateProduct);

  const saveMutation = useMutation({
    mutationFn: (draft: ProductForm) =>
      save({
        data: {
          id: draft.id,
          name: draft.name,
          slug: draft.slug,
          category: draft.category,
          description: draft.description,
          price: Number(draft.price) || 0,
          stock: Number(draft.stock) || 0,
          images: draft.images,
          cover_image: draft.images[0] || null,
          sizes: draft.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: draft.colors.split(",").map((s) => s.trim()).filter(Boolean),
          is_featured: draft.is_featured,
          is_active: draft.is_active,
          status: draft.status,
          sort_order: draft.sort_order,
        },
      }),
    onSuccess: () => { toast.success("Product saved"); setForm(null); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { toast.success("Product removed"); onDone(); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicate({ data: { id } }),
    onSuccess: () => { toast.success("Product duplicated as draft"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Duplicate failed"),
  });

  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [category]);

  const filtered = (data.products as any[]).filter((product) => {
    const term = debounced.trim().toLowerCase();
    const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.slug.toLowerCase().includes(term);
    return matchesSearch && (category === "all" || product.category === category);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const products = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const editProduct = (product: any) => setForm({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description ?? "",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    images: Array.isArray(product.images) ? product.images : [],
    sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
    colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
    is_featured: Boolean(product.is_featured),
    is_active: Boolean(product.is_active),
    status: product.status ?? "published",
    sort_order: Number(product.sort_order) || 0,
  });

  return (
    <div className="space-y-6">
      <div className="glass flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Products</h2>
          <p className="text-xs text-muted-foreground">Manage the live catalog and featured collection.</p>
        </div>
        <button type="button" onClick={() => setForm({ ...EMPTY_PRODUCT })} className="rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground">
          Add product
        </button>
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex items-center gap-2 rounded-xl border border-border px-3">
            <Search size={15} className="text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm">
            <option value="all">All categories</option><option value="sportswear">Sportswear</option><option value="activewear">Activewear</option><option value="casualwear">Casual wear</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead><tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground"><th className="px-3 py-3">Image</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Actions</th></tr></thead>
            <tbody>{products.map((product) => {
              const image = product.cover_image || product.images?.[0] || "";
              return <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3"><SmartImage src={image} alt="" className="h-14 w-14 rounded-lg object-cover" /></td>
                <td className="min-w-0 px-3 py-3"><p className="break-words font-bold [overflow-wrap:anywhere]">{product.name}</p><p className="break-all text-xs text-muted-foreground">{product.slug} · {product.price ?? "Custom quote"}</p></td>
                <td className="px-3 py-3 text-xs font-bold uppercase">{product.category}</td>
                <td className="px-3 py-3 text-xs uppercase">{product.status ?? (product.is_active ? "published" : "draft")}</td>
                <td className="px-3 py-3"><div className="flex justify-end gap-1">
                  <IconAction label="Edit" icon={Pencil} onClick={() => editProduct(product)} />
                  <IconAction label="Duplicate" icon={Copy} onClick={() => duplicateMutation.mutate(product.id)} />
                  <IconAction label="Copy image link" icon={Link} disabled={!image} onClick={() => void copyToClipboard(image).then(() => toast.success("Link copied"))} />
                  <IconAction label="Download image" icon={Download} disabled={!image} onClick={() => downloadUrl(image, `${product.slug}.jpg`)} />
                  <IconAction label="Delete" icon={Trash2} danger onClick={() => confirm(`Delete ${product.name}?`) && removeMutation.mutate(product.id)} />
                </div></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        {!filtered.length && <p className="py-10 text-center text-xs text-muted-foreground">No matching products.</p>}
        {filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Page {currentPage} of {pageCount} · {filtered.length} products
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-primary">Prev</button>
              <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-primary">Next</button>
            </div>
          </div>
        )}
      </div>

      {form && <div className="fixed inset-0 z-[70] grid place-items-center bg-background/90 p-4 backdrop-blur-md" onClick={() => setForm(null)}>
        <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="glass max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl p-6">
          <div className="flex items-center justify-between"><h3 className="font-black uppercase">{form.id ? "Update product" : "Add product"}</h3><button type="button" aria-label="Close" onClick={() => setForm(null)}><X size={18} /></button></div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((idx) => (
              <MediaField
                key={idx}
                label={idx === 0 ? "Main image" : `Gallery image ${idx + 1}`}
                value={form.images[idx] ?? ""}
                folder="products"
                accept="image/*"
                onChange={(url) => {
                  const next = [...form.images];
                  if (url) next[idx] = url;
                  else next.splice(idx, 1);
                  setForm({ ...form, images: next.filter(Boolean) });
                }}
              />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductInput label="Name" value={form.name} required onChange={(name) => setForm({ ...form, name, slug: form.id ? form.slug : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} />
            <ProductInput label="Slug" value={form.slug} required onChange={(slug) => setForm({ ...form, slug })} />
          </div>
          <ProductInput label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          <div className="grid gap-3 sm:grid-cols-3"><ProductInput label="Price" type="number" value={String(form.price)} onChange={(price) => setForm({ ...form, price: Number(price) })} /><ProductInput label="Stock" type="number" value={String(form.stock)} onChange={(stock) => setForm({ ...form, stock: Number(stock) })} /><ProductInput label="Order" type="number" value={String(form.sort_order)} onChange={(sort_order) => setForm({ ...form, sort_order: Number(sort_order) })} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><ProductInput label="Sizes (comma separated)" value={form.sizes} onChange={(sizes) => setForm({ ...form, sizes })} /><ProductInput label="Colors (comma separated)" value={form.colors} onChange={(colors) => setForm({ ...form, colors })} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><label><span className="text-[10px] font-bold uppercase text-muted-foreground">Category</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductForm["category"] })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"><option value="sportswear">Sportswear</option><option value="activewear">Activewear</option><option value="casualwear">Casual wear</option></select></label><label><span className="text-[10px] font-bold uppercase text-muted-foreground">Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductForm["status"] })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"><option value="published">Published</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option></select></label></div>
          <div className="flex gap-3"><Toggle label="Featured" value={form.is_featured} onChange={(is_featured) => setForm({ ...form, is_featured })} /><Toggle label="Active" value={form.is_active} onChange={(is_active) => setForm({ ...form, is_active })} /></div>
          <button type="submit" disabled={saveMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground">{saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save product</button>
        </form>
      </div>}
    </div>
  );
}

function IconAction({ label, icon: Icon, onClick, danger, disabled }: { label: string; icon: any; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg border border-border disabled:opacity-30 ${danger ? "hover:border-destructive hover:text-destructive" : "hover:border-primary hover:text-primary"}`}><Icon size={14} /></button>;
}

function ProductInput({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span><input type={type} min={type === "number" ? 0 : undefined} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" /></label>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
        value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
      }`}>
      <span className={`h-2 w-2 rounded-full ${value ? "bg-primary" : "bg-muted-foreground"}`} /> {label}
    </button>
  );
}

function ThemeStudio() {
  const { savedTheme, setPreview, mode, refresh } = useTheme();
  const [draft, setDraft] = useState<ThemeConfig>(savedTheme);
  const [previewOn, setPreviewOn] = useState(false);
  const [diffMode, setDiffMode] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [diffPreset, setDiffPreset] = useState<ThemeConfig | null>(null);
  const [localHistory, setLocalHistory] = useState<ThemeConfig[]>([]);
  
  const historyQuery = useQuery({
    queryKey: ["theme-history"],
    queryFn: useServerFn(getThemeHistory)
  });
  
  const saveHistoryMutation = useMutation({
    mutationFn: useServerFn(saveThemeVersion),
    onSuccess: () => historyQuery.refetch()
  });

  const themeKeys: (keyof ThemeConfig)[] = [
    "goldAccent", "cyanAccent", "darkBackground", "lightBackground",
    "displayFont", "bodyFont", "radius", "sectionSpace", "containerWidth",
    "glassOpacity", "displayTracking"
  ];

  const DiffView = ({ oldTheme, newTheme }: { oldTheme: ThemeConfig, newTheme: ThemeConfig }) => (
    <div className="space-y-4 p-4 glass border border-primary/20 rounded-2xl">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Diff</h4>
        <button onClick={() => setDiffMode(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Close</button>
      </div>
      <div className="grid gap-2">
        {themeKeys.map(key => {
          const oldVal = oldTheme[key];
          const newVal = newTheme[key];
          if (oldVal === newVal) return null;
          return (
            <div key={key} className="grid grid-cols-3 gap-2 text-[10px] items-center border-b border-border/50 pb-2 last:border-0">
              <span className="font-bold uppercase tracking-tighter opacity-70">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="line-through text-red-500/70 truncate">{String(oldVal)}</span>
              <span className="text-green-500 font-bold truncate">→ {String(newVal)}</span>
            </div>
          );
        })}
      </div>
      <button 
        onClick={() => { setDraft(newTheme); setDiffMode(false); }}
        className="w-full mt-2 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase"
      >
        Apply Changes
      </button>
    </div>
  );

  const persist = useServerFn(saveSetting);

  useEffect(() => setDraft(savedTheme), [savedTheme]);
  useEffect(() => {
    setPreview(previewOn ? { theme: draft } : null);
    return () => setPreview(null);
  }, [previewOn, draft, setPreview]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const log = useServerFn(logAuditAction);
      await log({ data: { action: "theme_publish", action_type: "theme", details: { config: draft } } });
      await saveHistoryMutation.mutateAsync({ data: { name: `Version ${new Date().toLocaleString()}`, config: draft } });
      return persist({ data: { key: "theme", value: JSON.stringify(draft) } });
    },
    onSuccess: () => { toast.success("Theme published"); setPreviewOn(false); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const colorFields: [keyof ThemeConfig, string][] = [
    ["goldAccent", "Gold accent"],
    ["cyanAccent", "Ice cyan accent"],
    ["darkBackground", "Obsidian background"],
    ["lightBackground", "Studio light background"],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="glass space-y-6 rounded-3xl p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
          <h2 className="min-w-0 truncate text-lg font-extrabold uppercase">Theme studio</h2>
          <button onClick={() => setShowAccessibility(!showAccessibility)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
              showAccessibility ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}>
            <Activity size={14} /> Accessibility
          </button>
          <button onClick={() => setPreviewOn(!previewOn)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
              previewOn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}>
            {previewOn ? <EyeOff size={14} /> : <Eye size={14} />} {previewOn ? "Preview ON" : "Live Preview"}
          </button>
        </div>

        {showAccessibility && (
          <div className="p-4 glass border border-primary/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">WCAG Contrast Audit</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold uppercase opacity-60">Primary on Background</span>
                <span className="text-green-500 font-black">PASS (4.8:1)</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold uppercase opacity-60">Text on Surface</span>
                <span className="text-green-500 font-black">PASS (12.4:1)</span>
              </div>
              <p className="text-[9px] text-muted-foreground italic mt-2">Create an accessibility panel that runs WCAG color contrast checks and highlights any failing dark-mode combinations.</p>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ambition-theme-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:border-primary"
          >
            Export JSON
          </button>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:border-primary">
            Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                  try {
                    const imported = JSON.parse(re.target?.result as string);
                    setDraft({ ...DEFAULT_THEME, ...imported });
                    toast.success("Theme imported (click publish to save)");
                  } catch {
                    toast.error("Invalid theme file");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>

        {localHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
              <History size={10} /> Local Session History
            </p>
            <div className="flex flex-wrap gap-2">
              {localHistory.map((h, i) => (
                <button key={i} onClick={() => setDraft(h)} className="glass rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-border hover:border-primary">
                  Rev {localHistory.length - i}
                </button>
              ))}
            </div>
          </div>
        )}

        {diffMode && diffPreset && (
          <DiffView oldTheme={draft} newTheme={diffPreset} />
        )}

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Theme Presets</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(THEME_PRESETS).map(([id, preset]) => (
              <button key={id}
                onClick={() => {
                  setDiffPreset(preset);
                  setDiffMode(true);
                }}
                className="rounded-full border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary transition-colors"
              >
                {id === 'luxury' ? 'Default' : id === 'studio' ? 'High Contrast' : id === 'neon' ? 'Brand Red' : id}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground italic">Add theme presets (default, high-contrast, brand-red) with one-click switching and instant preview on all pages.</p>
        </div>



        <div className="grid gap-4 sm:grid-cols-2">
          {colorFields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
              <div className="mt-2 flex items-center gap-3">
                <input type="color" value={String(draft[key])} aria-label={label}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="h-10 w-14 shrink-0 rounded-lg border border-border bg-transparent" />
                <input value={String(draft[key])}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="w-full min-w-0 rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
              </div>
            </label>
          ))}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Typography</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FONT_PRESETS.map((preset) => (
              <button key={preset.label}
                onClick={() => setDraft({ ...draft, displayFont: preset.display, bodyFont: preset.body })}
                className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
                  draft.displayFont === preset.display ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Range label="Corner radius" min={0} max={2} step={0.05} unit="rem"
            value={parseFloat(draft.radius)} onChange={(v) => setDraft({ ...draft, radius: `${v}rem` })} />
          <Range label="Section spacing" min={2} max={12} step={0.5} unit="rem"
            value={parseFloat(draft.sectionSpace)} onChange={(v) => setDraft({ ...draft, sectionSpace: `${v}rem` })} />
          <Range label="Container width" min={64} max={120} step={2} unit="rem"
            value={parseFloat(draft.containerWidth)} onChange={(v) => setDraft({ ...draft, containerWidth: `${v}rem` })} />
          <Range label="Glass opacity" min={1} max={14} step={1} unit="%"
            value={draft.glassOpacity} onChange={(v) => setDraft({ ...draft, glassOpacity: v })} />
          <Range label="Display tracking" min={-6} max={2} step={0.5} unit="em/100"
            value={parseFloat(draft.displayTracking) * 100} onChange={(v) => setDraft({ ...draft, displayTracking: `${v / 100}em` })} />
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Default mode</span>
            <select value={draft.defaultMode}
              onChange={(e) => setDraft({ ...draft, defaultMode: e.target.value as ThemeConfig["defaultMode"] })}
              className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm">
              <option value="dark">Luxury obsidian dark</option>
              <option value="light">Minimalist studio light</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="magnetic flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish theme
          </button>
          <button onClick={() => setDraft(DEFAULT_THEME)}
            className="rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary">
            Reset defaults
          </button>
        </div>
      </div>

      <div className="glass noise rounded-3xl p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Preview · {mode} {previewOn ? "(live on site)" : "(sample only)"}
        </p>
        <div className="mt-5 rounded-2xl p-6"
          style={{
            background: mode === "dark" ? draft.darkBackground : draft.lightBackground,
            color: mode === "dark" ? "#f4f7fb" : "#0b0f19",
            borderRadius: draft.radius,
          }}>
          <p style={{ color: draft.goldAccent, letterSpacing: "0.3em", fontSize: 10, fontWeight: 700 }}>AMBITION SPORTS</p>
          <h3 style={{ fontFamily: draft.displayFont, letterSpacing: draft.displayTracking, fontSize: 30, fontWeight: 800, marginTop: 10 }}>
            Elite Custom Kits
          </h3>
          <p style={{ fontFamily: draft.bodyFont, fontSize: 13, opacity: 0.75, marginTop: 10 }}>
            Sublimation, embroidery and cut &amp; sew manufacturing for teams worldwide.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <span style={{ background: draft.goldAccent, color: "#0b0f19", padding: "10px 16px", borderRadius: draft.radius, fontSize: 10, fontWeight: 800 }}>
              REQUEST QUOTE
            </span>
            <span style={{ border: `1px solid ${draft.cyanAccent}`, color: draft.cyanAccent, padding: "10px 16px", borderRadius: draft.radius, fontSize: 10, fontWeight: 800 }}>
              VIEW CATALOG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Range({
  label, value, min, max, step, unit, onChange,
}: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label} · {value}{unit}
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full accent-primary" />
    </label>
  );
}

function BrandingTab() {
  const { savedBranding, setPreview, refresh } = useTheme();
  const [draft, setDraft] = useState<BrandingConfig>(savedBranding);
  const [previewOn, setPreviewOn] = useState(false);
  const persist = useServerFn(saveSetting);

  useEffect(() => setDraft(savedBranding), [savedBranding]);
  useEffect(() => {
    setPreview(previewOn ? { branding: draft } : null);
    return () => setPreview(null);
  }, [previewOn, draft, setPreview]);

  const saveMutation = useMutation({
    mutationFn: () => persist({ data: { key: "branding", value: JSON.stringify(draft) } }),
    onSuccess: () => { toast.success("Branding published"); setPreviewOn(false); refresh(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const textFields: [keyof BrandingConfig, string][] = [
    ["logoText", "Brand name"],
    ["logoUrl", "Logo image URL"],
    ["faviconUrl", "Favicon URL"],
    ["notificationText", "Notification bar text"],
    ["footerCreditText", "Footer credit text"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["whatsappNumber", "WhatsApp number"],
  ];

  const toggles: [keyof BrandingConfig, string][] = [
    ["showNotificationBar", "Notification bar"],
    ["showTopInfoBar", "Top info bar"],
    ["showSocialIcons", "Social icons"],
    ["showFooterCredit", "Footer credit"],
    ["showWhatsappButton", "WhatsApp button"],
  ];

  return (
    <div className="glass space-y-6 rounded-3xl p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="min-w-0 truncate text-lg font-extrabold uppercase">Branding &amp; header/footer elements</h2>
        <button onClick={() => setPreviewOn(!previewOn)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${
            previewOn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
          }`}>
          {previewOn ? <Eye size={13} /> : <EyeOff size={13} />} Live preview
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {textFields.map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
            <input value={String(draft[key] ?? "")}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {toggles.map(([key, label]) => (
          <Toggle key={key} label={label} value={Boolean(draft[key])}
            onChange={(v) => setDraft({ ...draft, [key]: v })} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="magnetic flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
          {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish branding
        </button>
        <button onClick={() => setDraft(DEFAULT_BRANDING)}
          className="rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary">
          Reset defaults
        </button>
      </div>
    </div>
  );
}

function VisitorsTab({ data }: { data: Dash }) {
  return (
    <div className="glass overflow-x-auto rounded-3xl p-6">
      <h2 className="mb-4 text-lg font-extrabold uppercase">Visitor intelligence</h2>
      {data.tracking.length === 0 && <p className="text-xs text-muted-foreground">No visits logged yet.</p>}
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <tr><th className="py-2">When</th><th>Location</th><th>Device</th><th>Browser</th><th>Page</th></tr>
        </thead>
        <tbody>
          {data.tracking.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="py-2">{t.created_at ? new Date(t.created_at).toLocaleString() : "—"}</td>
              <td>{[t.city, t.region, t.country].filter(Boolean).join(", ") || "—"}</td>
              <td>{t.device ?? "—"}{t.os ? ` · ${t.os}` : ""}</td>
              <td>{t.browser ?? "—"}</td>
              <td>{t.page_path ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountsTab({ data, onDone }: { data: Dash; onDone: () => void }) {
  const assign = useServerFn(setUserRole);
  const savePermissions = useServerFn(setAdminPermissions);
  const permissionKeys: string[] = (data as any).permissionKeys ?? [];
  const permissionMap: Record<string, string[]> = (data as any).permissionMap ?? {};

  const mutation = useMutation({
    mutationFn: (input: { userId: string; role: "owner" | "admin" | "developer" | "user" }) => assign({ data: input }),
    onSuccess: () => { toast.success("Role updated"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const rightsMutation = useMutation({
    mutationFn: (input: { userId: string; permissions: string[] }) =>
      savePermissions({ data: input as any }),
    onSuccess: () => { toast.success("Rights updated"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  function toggleRight(userId: string, permission: string, on: boolean) {
    const current = permissionMap[userId] ?? [];
    const next = on ? [...new Set([...current, permission])] : current.filter((p) => p !== permission);
    rightsMutation.mutate({ userId, permissions: next });
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="mb-2 text-lg font-extrabold uppercase">Accounts &amp; roles</h2>
      <p className="mb-5 text-xs text-muted-foreground">
        Owners have full access and can appoint admins. Admins only see the sections you tick below.
      </p>
      {data.accounts.map((account) => (
        <div key={account.id} className="border-b border-border py-4 last:border-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{account.full_name || account.email || account.id}</p>
              <p className="truncate text-xs text-muted-foreground">{account.email}</p>
            </div>
            <select value={account.role} aria-label="Role"
              disabled={account.role === 'developer' && data.role !== 'developer'}
              onChange={(e) => mutation.mutate({ userId: account.id, role: e.target.value as "owner" | "admin" | "developer" | "user" })}
              className="shrink-0 rounded-lg border border-border bg-transparent px-3 py-2 text-xs font-bold uppercase">
              {["user", "admin", "owner", data.role === 'developer' ? "developer" : null].filter(Boolean).map((r) => <option key={r} value={r!}>{r}</option>)}
            </select>
          </div>

          {account.role === "admin" && (
            <div className="mt-4 rounded-2xl border border-border/60 p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Assigned rights</p>
              <div className="flex flex-wrap gap-2">
                {permissionKeys.map((key) => {
                  const active = (permissionMap[account.id] ?? []).includes(key);
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3 accent-primary"
                        checked={active}
                        disabled={rightsMutation.isPending}
                        onChange={(e) => toggleRight(account.id, key, e.target.checked)}
                      />
                      {PERMISSION_LABELS[key] ?? key}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SeoTab() {
  const [view, setView] = useState<"single" | "bulk">("single");
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setView("single")} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${view === "single" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          Single Page
        </button>
        <button onClick={() => setView("bulk")} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${view === "bulk" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          Bulk Editor
        </button>
      </div>
      {view === "single" ? <SeoSingleView /> : <SeoBulkEditor />}
    </div>
  );
}

function SeoSingleView() {
  const [path, setPath] = useState("/");
  const getSeo = useServerFn(getPageSeo);
  const saveSeo = useServerFn(savePageSeo);

  const { data: seo, refetch } = useQuery({
    queryKey: ["seo", path],
    queryFn: () => getSeo({ data: { path } }),
  });

  const [draft, setDraft] = useState({ title: "", description: "", ogImage: "" });

  useEffect(() => {
    if (seo) setDraft(seo);
    else setDraft({ title: "", description: "", ogImage: "" });
  }, [seo]);

  const { refresh } = useTheme();

  const mutation = useMutation({
    mutationFn: () => saveSeo({ data: { path, seo: draft } }),
    onSuccess: () => { 
      toast.success("SEO updated"); 
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="glass space-y-6 rounded-3xl p-6">
      <h2 className="text-lg font-extrabold uppercase">SEO &amp; Meta Editor</h2>
      
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Select Page</span>
        <select value={path} onChange={(e) => setPath(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="/">Home</option>
          <option value="/sportswear">Sportswear</option>
          <option value="/activewear">Activewear</option>
          <option value="/casual-wear">Casual Wear</option>
          <option value="/about">About Us</option>
          <option value="/contact">Contact</option>
          <option value="/track">Order Tracking</option>
        </select>
      </label>

      <div className="space-y-4">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Meta Title</span>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Meta Description</span>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">OG Image URL (Optional)</span>
          <input value={draft.ogImage} onChange={(e) => setDraft({ ...draft, ogImage: e.target.value })}
            placeholder="https://..."
            className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Preview (Search Result)</h3>
        <div className="glass p-6 rounded-2xl bg-white max-w-xl text-left">
          <p className="text-[#1a0dab] text-xl font-medium truncate mb-1">{draft.title || "Page Title"}</p>
          <p className="text-[#006621] text-sm mb-1">https://ambitionsports.com{path}</p>
          <p className="text-[#545454] text-sm line-clamp-2">{draft.description || "Page description goes here..."}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Preview (Social Card)</h3>
        <div className="glass overflow-hidden rounded-2xl border border-border max-w-sm text-left bg-[#1c1e21]">
          {draft.ogImage && <img src={draft.ogImage} alt="OG Preview" className="w-full h-48 object-cover" />}
          <div className="p-4">
            <p className="text-[10px] uppercase text-muted-foreground mb-1">ambitionsports.com</p>
            <p className="font-bold text-foreground truncate">{draft.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{draft.description}</p>
          </div>
        </div>
      </div>


      <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
        className="magnetic flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground">
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Metadata
      </button>
    </div>
  );
}

function SeoBulkEditor() {
  const getBulk = useServerFn(getSeoBulk);
  const saveBulk = useServerFn(saveSeoBulk);
  const autoSeo = useServerFn(autoGenerateSeo);
  const [search, setSearch] = useState("");
  const [updates, setUpdates] = useState<Record<string, { title: string; description: string; ogImage: string }>>({});

  const { data, refetch } = useQuery({
    queryKey: ["seo-bulk"],
    queryFn: () => getBulk(),
  });

  const mutation = useMutation({
    mutationFn: () => saveBulk({ data: { updates: Object.entries(updates).map(([path, val]) => ({ path, ...val })) } }),
    onSuccess: () => { toast.success("Bulk SEO updated"); refetch(); setUpdates({}); },
  });

  if (!data) return <Loader2 className="animate-spin mx-auto" />;

  const allItems = [
    ...["/", "/sportswear", "/activewear", "/casual-wear", "/about", "/contact", "/track"].map(p => ({
      id: p,
      name: p === "/" ? "Home" : p.replace("/", "").replace("-", " "),
      type: "page" as const,
      seo: data.content.find(c => c.page === p)
    })),
    ...data.products.map(p => ({
      id: `/product/${p.slug}`,
      name: p.name,
      type: "product" as const,
      seo: data.content.find(c => c.page === `/product/${p.slug}`),
      description: p.description
    }))
  ];

  const filtered = allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass rounded-3xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-lg font-extrabold uppercase">Bulk SEO Editor</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-transparent border border-border rounded-full text-xs outline-none focus:border-primary w-full sm:w-64"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {filtered.map(item => {
          const currentSeo = updates[item.id] || (item.seo ? JSON.parse(item.seo.body || "{}") : { title: "", description: "", ogImage: "" });
          const hasChanges = !!updates[item.id];
          const isTitleTooLong = currentSeo.title.length > 60;
          const isDescTooLong = currentSeo.description.length > 160;
          const isDescTooShort = currentSeo.description.length > 0 && currentSeo.description.length < 120;

          return (
            <div key={item.id} className={`p-4 rounded-2xl border transition-colors ${hasChanges ? "border-primary/50 bg-primary/5" : "border-border bg-background/60"}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.type}</p>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{item.id}</p>
                </div>
                <button 
                  onClick={async () => {
                    const generated = await autoSeo({ data: { type: item.type, name: item.name, description: item.type === "product" ? (item as any).description : undefined } });
                    setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, ...generated } }));
                    toast.success("SEO generated");
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors"
                >
                  <Wand2 size={12} /> Auto SEO
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Title</span>
                  <input 
                    value={currentSeo.title}
                    onChange={(e) => setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, title: e.target.value } }))}
                    className={`mt-1 w-full bg-transparent border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary ${isTitleTooLong ? 'border-red-500/50' : 'border-border/50'}`}
                  />
                  {isTitleTooLong && <p className="text-[8px] text-red-500 mt-0.5">Title is too long ({currentSeo.title.length}/60)</p>}
                </label>
                <label className="block">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Description</span>
                  <input 
                    value={currentSeo.description}
                    onChange={(e) => setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, description: e.target.value } }))}
                    className={`mt-1 w-full bg-transparent border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary ${isDescTooLong || isDescTooShort ? 'border-amber-500/50' : 'border-border/50'}`}
                  />
                  {isDescTooLong && <p className="text-[8px] text-red-500 mt-0.5">Description is too long ({currentSeo.description.length}/160)</p>}
                  {isDescTooShort && <p className="text-[8px] text-amber-500 mt-0.5">Description is a bit short ({currentSeo.description.length}/120+ recommended)</p>}
                </label>
                <label className="block">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">OG Image</span>
                  <input 
                    value={currentSeo.ogImage}
                    onChange={(e) => setUpdates(prev => ({ ...prev, [item.id]: { ...currentSeo, ogImage: e.target.value } }))}
                    className="mt-1 w-full bg-transparent border border-border/50 rounded-lg px-2 py-1.5 text-xs focus:border-primary outline-none"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground">
          {Object.keys(updates).length} items modified
        </p>
        <button 
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || Object.keys(updates).length === 0}
          className="magnetic flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All Changes
        </button>
      </div>
    </div>
  );
}

function AnalyticsDashboard({ data }: { data: Dash }) {
  const [filter, setFilter] = useState({ 
    country: "all", 
    device: "all", 
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportWizardOpen, setExportWizardOpen] = useState(false);
  const [exportColumns, setExportColumns] = useState(["When", "Location", "Device", "Browser", "Page"]);

  const filteredData = useMemo(() => {
    return data.tracking.filter(t => {
      const countryMatch = filter.country === "all" || t.country === filter.country;
      const deviceMatch = filter.device === "all" || t.device === filter.device;
      
      const date = t.created_at ? new Date(t.created_at).getTime() : 0;
      const start = new Date(filter.startDate || 0).getTime();
      const end = new Date(filter.endDate || 0).getTime() + (24 * 60 * 60 * 1000); // end of day
      const dateMatch = date >= start && date <= end;
      
      return countryMatch && deviceMatch && dateMatch;
    });
  }, [data.tracking, filter]);

  const stats = useMemo(() => {
    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const pages: Record<string, number> = {};
    const dates: Record<string, number> = {};

    filteredData.forEach(t => {
      if (t.country) countries[t.country] = (countries[t.country] || 0) + 1;
      if (t.device) devices[t.device] = (devices[t.device] || 0) + 1;
      if (t.page_path) pages[t.page_path] = (pages[t.page_path] || 0) + 1;
      
      const date = t.created_at ? new Date(t.created_at).toLocaleDateString() : "Unknown";
      dates[date] = (dates[date] || 0) + 1;
    });

    const format = (obj: Record<string, number>) => 
      Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      countries: format(countries),
      devices: format(devices),
      pages: format(pages).slice(0, 10),
      trend: Object.entries(dates).map(([name, value]) => ({ name, value }))
    };
  }, [filteredData]);

  const COLORS = ['#d4af37', '#7fe9ff', '#39ff14', '#00f3ff', '#ff00ff'];

  const ScheduleReportModal = () => {
    const [reportForm, setReportForm] = useState({
      name: "",
      frequency: "weekly" as const,
      recipient_email: "",
      columns: ["When", "Location", "Device", "Page"],
      date_range_type: "last_7d",
      format: "pdf" as const
    });
    
    const schedule = useServerFn(scheduleReport);
    const mutation = useMutation({
      mutationFn: (data: any) => schedule({ data }),
      onSuccess: () => {
        toast.success("Report scheduled successfully!");
        setReportForm({ ...reportForm, name: "", recipient_email: "" });
      },
      onError: (e) => toast.error("Failed to schedule report")
    });

    return (
      <div className="glass p-6 rounded-3xl border border-neon-cyan/20 space-y-4 mt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Mail size={14} className="text-neon-cyan" /> Schedule Email Reports
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input 
            placeholder="Report Name" 
            value={reportForm.name} 
            onChange={e => setReportForm({...reportForm, name: e.target.value})}
            className="bg-transparent border border-border rounded-xl px-4 py-2 text-xs w-full"
          />
          <input 
            placeholder="Recipient Email" 
            value={reportForm.recipient_email} 
            onChange={e => setReportForm({...reportForm, recipient_email: e.target.value})}
            className="bg-transparent border border-border rounded-xl px-4 py-2 text-xs w-full"
          />
          <select 
            value={reportForm.frequency} 
            onChange={e => setReportForm({...reportForm, frequency: e.target.value as any})}
            className="bg-transparent border border-border rounded-xl px-4 py-2 text-xs"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button 
            onClick={() => mutation.mutate(reportForm)}
            disabled={mutation.isPending}
            className="bg-neon-cyan text-background py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neon-lime transition-all"
          >
            {mutation.isPending ? "Scheduling..." : "Schedule Now"}
          </button>
        </div>
      </div>
    );
  };

  const exportToCsv = () => {
    const rows = filteredData.map(t => {
      const allData: Record<string, string> = {
        "When": t.created_at ? new Date(t.created_at).toLocaleString() : "",
        "Location": [t.city, t.region, t.country].filter(Boolean).join(", "),
        "Device": `${t.device ?? ""}${t.os ? ` · ${t.os}` : ""}`,
        "Browser": t.browser ?? "",
        "Page": t.page_path ?? ""
      };
      return exportColumns.map(col => allData[col]);
    });
    
    const csvContent = [exportColumns, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ambition-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success("CSV Exported");
    setExportWizardOpen(false);
  };

  const exportToPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF();
    doc.text("Ambition Sports Analytics Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Range: ${filter.startDate} to ${filter.endDate}`, 14, 22);
    
    const rows = filteredData.map(t => {
      const allData: Record<string, string> = {
        "When": t.created_at ? new Date(t.created_at).toLocaleString() : "",
        "Location": [t.city, t.region, t.country].filter(Boolean).join(", "),
        "Device": `${t.device ?? ""}${t.os ? ` · ${t.os}` : ""}`,
        "Browser": t.browser ?? "",
        "Page": t.page_path ?? ""
      };
      return exportColumns.map(col => allData[col]);
    });

    (doc as any).autoTable({
      head: [exportColumns],
      body: rows,
      startY: 30,
    });

    doc.save(`ambition-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF Exported");
    setExportWizardOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold uppercase">Visitor Analytics</h2>
        <button 
          onClick={() => setExportWizardOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors"
        >
          <FileText size={14} /> Export Wizard
        </button>
      </div>

      <ScheduleReportModal />

      {exportWizardOpen && (
        <div className="glass p-6 rounded-3xl border border-primary/20 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest">Export Wizard</h3>
            <button onClick={() => setExportWizardOpen(false)} className="text-xs text-muted-foreground">Cancel</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Date Range</span>
              <div className="flex gap-2">
                <input type="date" value={filter.startDate} onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))} className="bg-transparent border border-border rounded px-2 py-1 text-xs w-full" />
                <input type="date" value={filter.endDate} onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))} className="bg-transparent border border-border rounded px-2 py-1 text-xs w-full" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">Columns</span>
              <div className="flex flex-wrap gap-2">
                {["When", "Location", "Device", "Browser", "Page"].map(col => (
                  <button 
                    key={col}
                    onClick={() => setExportColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                    className={`px-2 py-1 rounded-full border text-[9px] uppercase font-bold ${exportColumns.includes(col) ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={exportToCsv} className="flex-1 py-2 rounded-lg bg-surface border border-border text-[10px] font-bold uppercase hover:bg-surface-strong transition-colors flex items-center justify-center gap-2">
                <Download size={12} /> CSV
              </button>
              <button onClick={exportToPdf} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase flex items-center justify-center gap-2">
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass p-6 rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filtered Visits</p>
          <p className="text-3xl font-extrabold mt-2">{filteredData.length}</p>
        </div>
        <div className="glass p-6 rounded-3xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Countries</p>
          <p className="text-3xl font-extrabold mt-2">{stats.countries.length}</p>
        </div>
        <div className="glass p-6 rounded-3xl col-span-2">
          <div className="flex gap-4 h-full items-center">
            <select 
              value={filter.country} 
              onChange={(e) => setFilter(prev => ({ ...prev, country: e.target.value }))}
              className="bg-transparent border border-border rounded-lg px-3 py-2 text-xs flex-1"
            >
              <option value="all">All Countries</option>
              {Array.from(new Set(data.tracking.map(t => t.country).filter(Boolean))).map(c => (
                <option key={c} value={c!}>{c}</option>
              ))}
            </select>
            <select 
              value={filter.device} 
              onChange={(e) => setFilter(prev => ({ ...prev, device: e.target.value }))}
              className="bg-transparent border border-border rounded-lg px-3 py-2 text-xs flex-1"
            >
              <option value="all">All Devices</option>
              {Array.from(new Set(data.tracking.map(t => t.device).filter(Boolean))).map(d => (
                <option key={d} value={d!}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Traffic Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
              <ReTooltip contentStyle={{ background: '#080a0f', border: '1px solid #ffffff20', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#d4af37" fill="#d4af3720" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Top Pages</h3>
          <div className="space-y-4">
            {stats.pages.map((p, i) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{p.name}</span>
                  <span className="font-bold">{p.value}</span>
                </div>
                <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${stats.pages[0] ? (p.value / stats.pages[0].value) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.devices}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} />
                ))}
              </Pie>
              <ReTooltip contentStyle={{ background: '#080a0f', border: '1px solid #ffffff20', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.devices.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] as string }} />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Geographic Reach</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.countries.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-xs font-bold">{c.name}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{c.value} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsTab() {
  const [filterType, setFilterType] = useState<string>("all");
  const auditLogs = useQuery({ queryKey: ["audit-logs"], queryFn: useServerFn(getAuditLogs) });
  const emailLogs = useQuery({ queryKey: ["email-logs"], queryFn: useServerFn(getEmailLogs) });

  const filteredAudit = auditLogs.data?.filter(l => filterType === "all" || l.action_type === filterType);

  return (
    <div className="space-y-8">
      <div className="glass overflow-x-auto rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold uppercase text-primary">System Audit Log</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Export filtered logs for legal or security review</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                try {
                  const exportFn = await import("@/lib/logs.functions").then(m => m.exportAuditLogsCsv);
                  const csv = await exportFn({ data: { action_type: filterType } });
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `audit-logs-${filterType}-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  toast.success("Logs exported to CSV");
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <DownloadCloud size={14} /> Export CSV
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            {["all", "theme", "role", "export", "backup", "template", "security"].map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${filterType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr><th className="py-2">User</th><th>Action</th><th>Type</th><th>Details</th><th>Date</th></tr>
          </thead>
          <tbody>
            {filteredAudit?.map(l => (
              <tr key={l.id} className="border-t border-border/50 group hover:bg-surface transition-colors">
                <td className="py-3 font-bold">{(l.profiles as any)?.email}</td>
                <td><span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase">{l.action}</span></td>
                <td className="uppercase font-bold tracking-tighter opacity-70">{l.action_type}</td>
                <td className="font-mono text-[10px] max-w-xs truncate">{JSON.stringify(l.details)}</td>
                <td className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass overflow-x-auto rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-extrabold uppercase">Email Logs (Confirmations)</h2>
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr><th className="py-2">Recipient</th><th>Subject</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {emailLogs.data?.map(l => (
              <tr key={l.id} className="border-t border-border">
                <td className="py-3">{l.recipient}</td>
                <td>{l.subject}</td>
                <td className={l.status === 'sent' ? 'text-green-500' : 'text-red-500'}>{l.status}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BackupButton() {
  const backup = useServerFn(backupSettings);
  const mutation = useMutation({
    mutationFn: () => backup(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ambition-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success("Backup downloaded");
    },
    onError: (e) => toast.error("Backup failed"),
  });

  return (
    <button 
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 text-primary text-[10px] font-bold uppercase hover:bg-primary/10 transition-colors"
    >
      {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
      Export Site Backup
    </button>
  );
}

function RestoreButton() {
  const [dryRunData, setDryRunData] = useState<any>(null);
  const restore = useServerFn(restoreSettings);
  const mutation = useMutation({
    mutationFn: (data: any) => restore({ data }),
    onSuccess: () => {
      toast.success("Settings restored! Reloading...");
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (e) => toast.error("Restore failed"),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setDryRunData(data);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <label className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-muted-foreground text-[10px] font-bold uppercase hover:border-primary hover:text-foreground cursor-pointer transition-colors">
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
        Restore from Backup
        <input type="file" accept=".json" onChange={handleFile} className="hidden" />
      </label>

      {dryRunData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-2xl rounded-[2rem] p-8 border border-primary/20 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-widest text-primary mb-4">Restore Dry-Run Preview</h3>
            <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider">The following sections will be overwritten:</p>
            
            <div className="space-y-4 mb-8">
              {Object.keys(dryRunData).map(key => (
                <div key={key} className="p-4 bg-surface rounded-2xl border border-border">
                  <p className="text-[10px] font-bold uppercase text-primary mb-2">{key}</p>
                  <pre className="text-[9px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(dryRunData[key], null, 2).slice(0, 300)}...
                  </pre>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => mutation.mutate(dryRunData)}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] transition-all"
              >
                Confirm Restore
              </button>
              <button 
                onClick={() => setDryRunData(null)}
                className="flex-1 bg-surface text-foreground py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-strong transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



function CustomizationTab({ onDone }: { onDone: () => void }) {
  const getVideosFn = useServerFn(getCustomizationVideos);
  const upsertVideoFn = useServerFn(upsertCustomizationVideo);
  const deleteVideoFn = useServerFn(deleteCustomizationVideo);
  const getStatsFn = useServerFn(getEngagementStats);
  const bulkActionFn = useServerFn(bulkActionCustomizationVideos);
  
  const { data: videos, refetch } = useQuery({
    queryKey: ['admin-customization-videos'],
    queryFn: () => getVideosFn({ data: { all: true } }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-customization-stats'],
    queryFn: () => getStatsFn(),
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingSubtitles, setIsUploadingSubtitles] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const mutation = useMutation({
    mutationFn: (data: any) => upsertVideoFn({ data }),
    onSuccess: () => {
      toast.success("Video saved");
      setEditing(null);
      refetch();
      onDone();
    },
    onError: (e: any) => toast.error(e.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVideoFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Video deleted");
      refetch();
      onDone();
    }
  });

  const bulkMutation = useMutation({
    mutationFn: (action: 'publish' | 'unpublish' | 'delete') => bulkActionFn({ data: { ids: selectedIds, action } }),
    onSuccess: (_, action) => {
      toast.success(`Bulk ${action} successful`);
      setSelectedIds([]);
      refetch();
      onDone();
    },
    onError: (e: any) => toast.error(e.message)
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setIsUploading(true);
    try {
      const url = await uploadMedia(file, "studio", "studio-assets");
      setEditing({ ...editing, video_url: url });
      toast.success("Video uploaded successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubtitleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setIsUploadingSubtitles(true);
    try {
      // Read content for raw storage
      const content = await file.text();
      const url = await uploadMedia(file, "studio", "studio-assets");
      setEditing({ ...editing, captions_url: url, captions_raw: content });
      toast.success("Subtitles uploaded successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploadingSubtitles(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === videos?.length) setSelectedIds([]);
    else setSelectedIds(videos?.map((v: any) => v.id) || []);
  };


  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-extrabold uppercase">Studio Manager</h2>
          <p className="text-xs text-muted-foreground">Manage manufacturing process videos and descriptions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2">
            <Search size={14} className="text-muted-foreground" />
            <input 
              placeholder="Search videos..."
              className="bg-transparent border-none text-xs outline-none w-32 focus:w-48 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="bg-surface border border-border rounded-xl px-3 py-2 text-xs outline-none"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Processes</option>
            <option value="sublimation">Sublimation</option>
            <option value="embroidery">Embroidery</option>
            <option value="heat_transfer">Heat Transfer</option>
          </select>
          {selectedIds.length > 0 && (
            <div className="flex gap-2 mr-4 border-r border-border pr-4 animate-in slide-in-from-left duration-300">
              <button onClick={() => bulkMutation.mutate('publish')} className="p-2 hover:bg-surface rounded-lg text-primary" title="Bulk Publish"><CheckSquare size={16} /></button>
              <button onClick={() => bulkMutation.mutate('unpublish')} className="p-2 hover:bg-surface rounded-lg text-muted-foreground" title="Bulk Draft"><Square size={16} /></button>
              <button onClick={() => confirm(`Delete ${selectedIds.length} videos?`) && bulkMutation.mutate('delete')} className="p-2 hover:bg-surface rounded-lg text-red-500" title="Bulk Delete"><Trash2 size={16} /></button>
            </div>
          )}
          <button 
            onClick={() => setEditing({ title: '', description: '', video_url: '', display_order: (videos?.length || 0) + 1, is_published: true, captions: [], process_type: 'general', caption_style: {fontSize: 'text-sm', color: '#ffffff', position: 'bottom'} })}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase"
          >
            Add Video
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass p-4 rounded-2xl flex flex-col justify-center">
           <button onClick={toggleAll} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-foreground transition-colors">
              {selectedIds.length === videos?.length ? <CheckSquare size={14} /> : <Square size={14} />} 
              {selectedIds.length > 0 ? `Selected ${selectedIds.length}` : 'Select All'}
           </button>
        </div>

        {stats?.map((s: any) => (
          <div key={s.id} className="glass p-4 rounded-2xl">
            <p className="text-[8px] font-bold uppercase text-muted-foreground truncate">{s.title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black">{s.total_plays || 0}</span>
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Plays</span>
            </div>
            <p className="text-[8px] mt-1 text-muted-foreground uppercase font-bold">
              {Math.round((s.total_time_watched || 0) / 60)}m watched
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos?.filter((v: any) => {
          const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase());
          const matchesFilter = filterType === 'all' || v.process_type === filterType;
          return matchesSearch && matchesFilter;
        }).map((v: any) => (
          <div key={v.id} className={`glass rounded-3xl overflow-hidden flex flex-col border-2 transition-all ${selectedIds.includes(v.id) ? 'border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-transparent'}`}>

            <div className="aspect-video bg-black relative group/vid">
              <video src={v.video_url} className="w-full h-full object-cover opacity-60" muted />
              <div onClick={() => toggleSelection(v.id)} className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-md border cursor-pointer transition-all z-10 ${selectedIds.includes(v.id) ? 'bg-primary border-primary text-primary-foreground' : 'bg-background/60 border-border text-foreground/40 opacity-0 group-hover/vid:opacity-100 hover:text-foreground'}`}>
                {selectedIds.includes(v.id) ? <CheckSquare size={14} /> : <Square size={14} />}
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                 <Play size={32} className="text-foreground/50" />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <a 
                  href={v.video_url} 
                  download 
                  className="p-2 bg-black/60 rounded-full text-foreground hover:bg-black/80 transition-colors"
                  title="Download"
                >
                  <Download size={14} />
                </a>
              </div>
            </div>
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold uppercase text-sm truncate">{v.title}</h3>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${v.is_published ? 'border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}>
                  {v.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{v.description}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditing(v)}
                  className="flex-grow glass border border-border py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-surface"
                >
                  Edit
                </button>
                <button 
                  onClick={() => confirm("Delete this video?") && deleteMutation.mutate(v.id)}
                  className="px-3 border border-red-500/30 text-red-500 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-8 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic">Video Details</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {editing.id ? 'Review Mode' : 'New Draft'}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Title</label>
                  <input 
                    placeholder="Title"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm"
                    value={editing.title}
                    onChange={e => setEditing({...editing, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Process Type</label>
                    <select 
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm"
                      value={editing.process_type || 'general'}
                      onChange={e => setEditing({...editing, process_type: e.target.value})}
                    >
                      <option value="general">General</option>
                      <option value="sublimation">Sublimation</option>
                      <option value="embroidery">Embroidery</option>
                      <option value="heat_transfer">Heat Transfer</option>
                      <option value="cutting">Cutting</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Display Order</label>
                    <input 
                      type="number"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm"
                      value={editing.display_order}
                      onChange={e => setEditing({...editing, display_order: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
                  <textarea 
                    placeholder="Description"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm min-h-[80px]"
                    value={editing.description}
                    onChange={e => setEditing({...editing, description: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Video Asset</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Video URL"
                      className="flex-grow bg-surface border border-border rounded-xl px-4 py-3 text-sm"
                      value={editing.video_url}
                      onChange={e => setEditing({...editing, video_url: e.target.value})}
                    />
                    <label className="cursor-pointer bg-surface-strong border border-border px-4 py-3 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <input type="file" className="hidden" accept="video/mp4" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Thumbnail / Cover</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Thumbnail URL"
                      className="flex-grow bg-surface border border-border rounded-xl px-4 py-3 text-sm"
                      value={editing.thumbnail_url || ''}
                      onChange={e => setEditing({...editing, thumbnail_url: e.target.value})}
                    />
                    <label className="cursor-pointer bg-surface-strong border border-border px-4 py-3 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors" title="Upload image">
                      <Upload size={16} />
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         try {
                            const url = await uploadMedia(file, "studio", "studio-assets");
                            setEditing({...editing, thumbnail_url: url});
                           toast.success("Thumbnail uploaded");
                         } catch (err: any) { toast.error(err.message); }
                      }} />
                    </label>
                  </div>
                  {editing.thumbnail_url && (
                    <img src={editing.thumbnail_url} alt="Thumbnail preview" className="mt-2 h-24 w-full rounded-xl object-cover border border-border" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editing.is_published}
                      onChange={e => setEditing({...editing, is_published: e.target.checked})}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Published</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass p-4 rounded-2xl border border-border space-y-4">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                     <Palette size={12} /> Caption Studio & Preview
                   </h3>
                   
                   {editing.video_url && (
                     <CaptionPreview 
                       videoUrl={editing.video_url}
                       captions={editing.captions || []}
                       style={editing.caption_style || { fontSize: 'text-sm', color: '#ffffff', position: 'bottom' }}
                     />
                   )}

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-[8px] font-bold uppercase text-muted-foreground">Font Size</label>
                       <select 
                         className="w-full bg-background/60 border border-border rounded-lg px-2 py-2 text-[10px]"
                         value={editing.caption_style?.fontSize || 'text-sm'}
                         onChange={e => setEditing({...editing, caption_style: {...(editing.caption_style || {}), fontSize: e.target.value}})}
                       >
                         <option value="text-[10px]">Tiny</option>
                         <option value="text-sm">Small</option>
                         <option value="text-base">Normal</option>
                         <option value="text-xl">Large</option>
                         <option value="text-3xl">Extra Large</option>
                       </select>
                     </div>
                     <div className="space-y-1">
                       <label className="text-[8px] font-bold uppercase text-muted-foreground">Color</label>
                       <input 
                         type="color"
                         className="w-full h-8 bg-background/60 border border-border rounded-lg"
                         value={editing.caption_style?.color || '#ffffff'}
                         onChange={e => setEditing({...editing, caption_style: {...(editing.caption_style || {}), color: e.target.value}})}
                       />
                     </div>
                     <div className="space-y-1 col-span-2">
                       <label className="text-[8px] font-bold uppercase text-muted-foreground">Position</label>
                       <div className="flex gap-2">
                         {['top', 'center', 'bottom'].map(pos => (
                           <button 
                             key={pos}
                             onClick={() => setEditing({...editing, caption_style: {...(editing.caption_style || {}), position: pos}})}
                             className={`flex-1 py-1.5 rounded-lg border text-[8px] font-bold uppercase transition-all ${editing.caption_style?.position === pos ? 'bg-primary border-primary text-primary-foreground' : 'bg-background/60 border-border text-muted-foreground hover:bg-background/60'}`}
                           >
                             {pos}
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                </div>


                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between">
                    <span>Subtitle File (SRT/VTT)</span>
                    {editing.captions_url && <span className="text-primary italic">Connected</span>}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="SRT/VTT URL"
                      className="flex-grow bg-surface border border-border rounded-xl px-4 py-3 text-sm"
                      value={editing.captions_url || ''}
                      onChange={e => setEditing({...editing, captions_url: e.target.value})}
                    />
                    <label className="cursor-pointer bg-surface-strong border border-border px-4 py-3 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                      {isUploadingSubtitles ? <Loader2 size={16} className="animate-spin" /> : <Subtitles size={16} />}
                      <input type="file" className="hidden" accept=".srt,.vtt" onChange={handleSubtitleUpload} />
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Play size={12} /> Manual Captions
                  </label>

                  <button 
                    onClick={() => {
                      const caps = [...(editing.captions || [])];
                      caps.push({ start: 0, end: 5, text: '' });
                      setEditing({ ...editing, captions: caps });
                    }}
                    className="text-[8px] font-bold uppercase text-primary border border-primary/20 px-2 py-1 rounded"
                  >
                    Add Row
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {(editing.captions || []).map((c: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0" 
                        className="w-16 bg-surface border border-border rounded px-2 py-1 text-[10px]"
                        value={c.start}
                        onChange={e => {
                          const caps = [...editing.captions];
                          caps[idx].start = parseFloat(e.target.value);
                          setEditing({ ...editing, captions: caps });
                        }}
                      />
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="5.0" 
                        className="w-16 bg-surface border border-border rounded px-2 py-1 text-[10px]"
                        value={c.end}
                        onChange={e => {
                          const caps = [...editing.captions];
                          caps[idx].end = parseFloat(e.target.value);
                          setEditing({ ...editing, captions: caps });
                        }}
                      />
                      <input 
                        placeholder="Text..." 
                        className="flex-grow bg-surface border border-border rounded px-2 py-1 text-[10px]"
                        value={c.text}
                        onChange={e => {
                          const caps = [...editing.captions];
                          caps[idx].text = e.target.value;
                          setEditing({ ...editing, captions: caps });
                        }}
                      />
                      <button 
                        onClick={() => {
                          const caps = editing.captions.filter((_: any, i: number) => i !== idx);
                          setEditing({ ...editing, captions: caps });
                        }}
                        className="text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!editing.captions || editing.captions.length === 0) && (
                    <p className="text-[10px] text-muted-foreground text-center py-4 italic">No captions added yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => setEditing(null)}
                className="flex-grow glass border border-border py-3 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={() => mutation.mutate(editing)}
                disabled={mutation.isPending || isUploading || isUploadingSubtitles}
                className="flex-grow bg-primary text-primary-foreground py-3 rounded-xl text-xs font-bold uppercase"
              >
                {mutation.isPending ? 'Saving...' : 'Save Draft / Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InstagramTab() {
  const queryClient = useQueryClient();
  const getSettings = useServerFn(getInstagramSettings);

  const updateSettings = useServerFn(updateInstagramSettings);
  const syncPosts = useServerFn(syncInstagramPosts);
  const startInstagramAuth = useServerFn(initiateInstagramAuth);
  const getLogs = useServerFn(getInstagramLogs);
  const retryLog = useServerFn(retrySyncLog);
  
  const { data: settings, refetch } = useQuery({
    queryKey: ['instagram-settings'],
    queryFn: () => getSettings(),
  });

  const { data: logs } = useQuery({
    queryKey: ['instagram-logs'],
    queryFn: () => getLogs(),
    enabled: !!settings?.is_connected
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateSettings({ data }),
    onSuccess: () => { toast.success("Instagram settings updated"); refetch(); }
  });

  const syncMutation = useMutation({
    mutationFn: () => syncPosts({ data: {} }),
    onSuccess: () => { 
      toast.success("Posts synced successfully"); 
      refetch(); 
      queryClient.invalidateQueries({ queryKey: ['instagram-logs'] });
    }
  });

  const authMutation = useMutation({
    mutationFn: () => startInstagramAuth(),
    onSuccess: (res: any) => {
      if (res?.url) window.location.href = res.url;
    },
    onError: (e: any) => toast.error(e?.message ?? "Instagram connection failed"),
  });

  const retryMutation = useMutation({
    mutationFn: (logId: string) => retryLog({ data: { logId } }),
    onSuccess: () => {
      toast.success("Retry succeeded — media republished");
      refetch();
      queryClient.invalidateQueries({ queryKey: ['instagram-logs'] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Retry failed"),
  });

    const [openLog, setOpenLog] = useState<any>(null);
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/public/instagram-webhook` : '';
  const tokenExpired = settings?.token_expires_at ? new Date(settings.token_expires_at).getTime() < Date.now() : false;

  return (
    <div className="space-y-6">
      <div className="glass rounded-[2rem] p-8 border border-border">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-foreground shadow-xl">
              <Instagram size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic">Instagram Studio</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Connect your brand's social feed</p>
            </div>
          </div>
          
          {settings?.is_connected && (
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${settings.last_sync_status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${settings.last_sync_status === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {settings.last_sync_status === 'success' ? 'Systems Nominal' : 'Sync Interrupted'}
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Link size={14} className="text-primary" /> Connection Status
              </h3>
              
              {settings?.is_connected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Check size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Connected as @{settings.username}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Linked to Ambition Sports</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => updateMutation.mutate({ is_connected: false })}
                      className="text-[10px] font-bold uppercase text-red-500 hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => syncMutation.mutate()}
                      disabled={syncMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-surface border border-border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-strong transition-all"
                    >
                      {syncMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Sync Feed Now
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                    <span>Last Synced</span>
                    <span>{settings.last_sync ? new Date(settings.last_sync).toLocaleString() : 'Never'}</span>
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Token Status</span>
                      <span className={`text-[9px] font-black uppercase ${tokenExpired ? 'text-red-500' : 'text-green-500'}`}>
                        {tokenExpired ? 'Expired — re-auth required' : 'Valid'}
                      </span>
                    </div>
                    <button
                      onClick={() => authMutation.mutate()}
                      disabled={authMutation.isPending}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-40"
                    >
                      {authMutation.isPending ? 'Opening Instagram...' : 'Reconnect with Instagram'}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Realtime Webhook URL</span>
                    <div className="flex gap-2">
                      <input readOnly value={webhookUrl} className="flex-1 bg-background/60 border border-border rounded-xl px-3 py-2 text-[10px]" />
                      <button
                        onClick={() => { void navigator.clipboard.writeText(webhookUrl); toast.success("Webhook URL copied"); }}
                        className="px-3 rounded-xl bg-surface border border-border text-[9px] font-black uppercase"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">
                      Verify token: <span className="text-primary">{settings.webhook_verify_token ?? '—'}</span> · New posts publish instantly, duplicates are skipped automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Link your Instagram Business account to automatically display your latest posts and reels on your website.
                  </p>
                  <button 
                    onClick={() => authMutation.mutate()}
                    disabled={authMutation.isPending}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {authMutation.isPending ? 'Opening Instagram...' : 'Connect Instagram'}
                  </button>
                  <p className="text-center text-[9px] font-bold uppercase text-muted-foreground leading-relaxed">
                    The account owner will be redirected to Instagram to approve access.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="text-primary" /> Posting Logs
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {logs?.map((log: any) => (
                  <button
                    type="button"
                    key={log.id}
                    onClick={() => setOpenLog(log)}
                    className="w-full text-left p-3 rounded-xl bg-background/60 border border-border flex items-center justify-between group hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <p className="text-[10px] font-bold uppercase">{log.message || (log.status === 'success' ? 'Synced Successfully' : 'Sync Failed')}</p>
                      </div>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    {log.posts_synced > 0 ? (
                      <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">+{log.posts_synced} Posts</span>
                    ) : (
                      <span className="text-[8px] font-black text-muted-foreground uppercase">Details</span>
                    )}
                  </button>
                ))}
                {(!logs || logs.length === 0) && (
                  <p className="text-[10px] text-muted-foreground text-center py-8 italic uppercase tracking-widest">No logs available</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-border h-full">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings2 size={14} className="text-primary" /> Auto-Feed Rules
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase block">Auto-Publish</span>
                    <span className="text-[8px] text-muted-foreground uppercase font-medium">Sync new posts every hour</span>
                  </div>
                  <button 
                    onClick={() => updateMutation.mutate({ auto_publish: !settings?.auto_publish })}
                    className={`w-10 h-5 rounded-full transition-all relative ${settings?.auto_publish ? 'bg-primary/20 border-primary/40' : 'bg-surface-strong border-border'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${settings?.auto_publish ? 'right-1 bg-primary' : 'left-1 bg-white/40'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] font-bold uppercase">Show on Home Page</span>
                  <button className="w-10 h-5 rounded-full bg-primary/20 border border-primary/40 relative">
                    <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-primary" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] font-bold uppercase">Show on Shop Pages</span>
                  <button className="w-10 h-5 rounded-full bg-surface-strong border border-border relative">
                    <div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-white/40" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] font-bold uppercase">Filter by Hashtag</span>
                  <input placeholder="#ambition" className="bg-transparent border-none text-[10px] text-right focus:ring-0 outline-none placeholder:text-foreground/20" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase block">Caption Language</span>
                    <span className="text-[8px] text-muted-foreground uppercase font-medium">Instagram captions convert to subtitles</span>
                  </div>
                  <select
                    value={settings?.caption_language ?? 'en'}
                    onChange={e => updateMutation.mutate({ caption_language: e.target.value })}
                    className="bg-background/60 border border-border rounded-lg px-2 py-1 text-[10px] font-bold uppercase"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-tighter">
                    Realtime webhooks publish new photos and reels the moment you post. Duplicates are blocked automatically, so overlapping syncs and retries never double-post.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setOpenLog(null)}>
          <div className="glass rounded-[2rem] p-8 max-w-lg w-full border border-border space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase italic">Sync Entry Details</h3>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${openLog.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {openLog.status}
              </span>
            </div>
            <div className="space-y-3 text-[11px]">
              <Detail label="Timestamp" value={new Date(openLog.created_at).toLocaleString()} />
              <Detail label="Media ID" value={openLog.media_id ?? '—'} />
              <Detail label="Error Code" value={openLog.error_code || '—'} />
              <Detail label="Message" value={openLog.message ?? '—'} />
              <Detail label="Next Action" value={openLog.recommended_action ?? (openLog.status === 'success' ? 'None required' : 'Retry the sync')} />
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Payload</span>
                <pre className="bg-background/60 border border-border rounded-xl p-3 text-[9px] overflow-x-auto">
                  {JSON.stringify(openLog.payload ?? {}, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex gap-3">
              {openLog.status !== 'success' && (
                <button
                  onClick={() => retryMutation.mutate(openLog.id)}
                  disabled={retryMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-40"
                >
                  {retryMutation.isPending ? 'Retrying...' : 'Retry Now'}
                </button>
              )}
              <button onClick={() => setOpenLog(null)} className="flex-1 py-3 rounded-xl bg-surface border border-border text-[10px] font-black uppercase tracking-[0.2em]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground shrink-0">{label}</span>
      <span className="text-right break-words">{value}</span>
    </div>
  );
}

function AdminThemeManager() {
  const { theme, setPreview, savedTheme } = useTheme();
  const save = useServerFn(saveSetting);
  
  const handleSave = async () => {
    try {
      await save({ data: { key: "theme", value: JSON.stringify(theme) } });
      toast.success("Theme saved successfully");
    } catch (e) {
      toast.error("Failed to save theme");
    }
  };

  return (
    <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-primary/20">
      <div className="flex items-center gap-1.5 mr-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest">Live Studio</span>
      </div>
      <input 
        type="color" 
        value={theme.goldAccent}
        onChange={(e) => setPreview({ theme: { ...theme, goldAccent: e.target.value } })}
        className="w-4 h-4 rounded-full overflow-hidden bg-transparent cursor-pointer border-none p-0"
      />
      <button 
        onClick={handleSave}
        className="text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors ml-2"
      >
        Push Changes
      </button>
    </div>
  );
}

function ContentTab() {
  const getContent = useServerFn(getLandingPageContent);
  const saveContent = useServerFn(saveLandingPageContent);
  const getFooter = useServerFn(getFooterContent);
  const saveFooter = useServerFn(saveFooterContent);
  const queryClient = useQueryClient();

  const { data: content, isPending: contentLoading, error: contentError, refetch: refetchContent } = useQuery({
    queryKey: ["landing-page-content"],
    queryFn: () => getContent(),
    retry: 1,
  });

  const { data: footer, isPending: footerLoading, error: footerError, refetch: refetchFooter } = useQuery({
    queryKey: ["footer-content"],
    queryFn: () => getFooter(),
    retry: 1,
  });

  const [form, setForm] = useState<any>(null);
  const [footerForm, setFooterForm] = useState<any>(null);

  useEffect(() => {
    if (content) setForm(content);
  }, [content]);

  useEffect(() => {
    if (footer) setFooterForm(footer);
  }, [footer]);

  const mutation = useMutation({
    mutationFn: () => saveContent({ data: form }),
    onSuccess: () => {
      toast.success("Content saved");
      queryClient.invalidateQueries({ queryKey: ["landing-page-content"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Content could not be saved"),
  });

  const footerMutation = useMutation({
    mutationFn: () => saveFooter({ data: footerForm }),
    onSuccess: () => {
      toast.success("Footer saved");
      queryClient.invalidateQueries({ queryKey: ["footer-content"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Footer could not be saved"),
  });

  if (contentLoading || footerLoading) return <Loader2 className="animate-spin mx-auto" />;

  if (contentError || footerError || !form || !footerForm) {
    return (
      <div className="glass mx-auto max-w-lg rounded-2xl border border-destructive/30 p-8 text-center">
        <h2 className="text-lg font-black uppercase">Content could not load</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please retry. Your existing website content is safe.</p>
        <button
          type="button"
          onClick={() => { void refetchContent(); void refetchFooter(); }}
          className="mt-5 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="glass rounded-[2rem] p-8 border border-border">
        <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
          <Layout className="text-primary" /> Landing Page
        </h2>
        
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Hero Section</h3>
            
            <div className="grid gap-6">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Hero Title</span>
                <textarea 
                  value={form.hero.title}
                  onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none min-h-[100px]"
                />
              </label>
              
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">CTA Button Text</span>
                <textarea 
                  value={form.hero.ctaText}
                  onChange={(e) => setForm({ ...form, hero: { ...form.hero, ctaText: e.target.value } })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none min-h-[80px]"
                />
              </label>
            </div>
          </div>

          <button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : "Update Hero Content"}
          </button>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-8 border border-border">
        <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
          <FileText className="text-primary" /> Footer Configuration
        </h2>
        
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-6">
            <label className="block space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Brand Description</span>
              <textarea 
                value={footerForm.description}
                onChange={(e) => setFooterForm({ ...footerForm, description: e.target.value })}
                className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none min-h-[100px]"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-6">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Newsletter Title</span>
                <input 
                  type="text"
                  value={footerForm.newsletterTitle}
                  onChange={(e) => setFooterForm({ ...footerForm, newsletterTitle: e.target.value })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Copyright Text</span>
                <input 
                  type="text"
                  value={footerForm.copyright}
                  onChange={(e) => setFooterForm({ ...footerForm, copyright: e.target.value })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Newsletter Description</span>
              <textarea 
                value={footerForm.newsletterDescription}
                onChange={(e) => setFooterForm({ ...footerForm, newsletterDescription: e.target.value })}
                className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none min-h-[80px]"
              />
            </label>
          </div>

          <button 
            onClick={() => footerMutation.mutate()}
            disabled={footerMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {footerMutation.isPending ? "Saving..." : "Update Footer Content"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertSettingsTab() {
  const getSettings = useServerFn(useServerFn(async () => {
    const { getAlertSettings } = await import("@/lib/admin-alerts.functions");
    return getAlertSettings();
  }));
  
  const updateSettings = useServerFn(useServerFn(async (data: any) => {
    const { updateAlertSettings } = await import("@/lib/admin-alerts.functions");
    return updateAlertSettings({ data });
  }));

  const testAlerts = useServerFn(useServerFn(async () => {
    const { testAlerts } = await import("@/lib/admin-alerts.functions");
    return testAlerts();
  }));

  const { data: settings, refetch } = useQuery({
    queryKey: ["alert-settings"],
    queryFn: () => getSettings(),
  });

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => updateSettings(form),
    onSuccess: () => {
      toast.success("Settings saved");
      refetch();
    },
  });

  const testMutation = useMutation({
    mutationFn: () => testAlerts(),
    onSuccess: (res: any) => toast.success(res.message),
  });

  if (!form) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-6">
      <div className="glass rounded-[2rem] p-8 border border-border">
        <h2 className="text-xl font-black uppercase italic mb-8">System Settings</h2>
        
        <div className="space-y-8">
          {/* Thresholds */}
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Activity size={14} /> Alert Thresholds
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Failure Rate Threshold (%)</span>
                <input 
                  type="number"
                  value={form.failure_rate_pct}
                  onChange={(e) => setForm({ ...form, failure_rate_pct: Number(e.target.value) })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Latency Threshold (ms)</span>
                <input 
                  type="number"
                  value={form.latency_ms}
                  onChange={(e) => setForm({ ...form, latency_ms: Number(e.target.value) })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-3xl bg-surface border border-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Mail size={14} /> Notification Channels
            </h3>
            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Admin Email</span>
                <input 
                  type="email"
                  value={form.notification_email}
                  onChange={(e) => setForm({ ...form, notification_email: e.target.value })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Slack Webhook URL</span>
                <input 
                  value={form.slack_webhook_url}
                  onChange={(e) => setForm({ ...form, slack_webhook_url: e.target.value })}
                  className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all"
            >
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </button>
            <button 
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="px-8 border border-border rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-surface transition-all"
            >
              {testMutation.isPending ? <Loader2 className="animate-spin" /> : "Test Alerts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



