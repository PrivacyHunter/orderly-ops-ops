import { Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Send, MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useTheme } from "./ThemeProvider";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFooterContent } from "@/lib/content.functions";
import { getSiteBlocks } from "@/lib/site-blocks.functions";
import { FaWhatsapp } from "react-icons/fa";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { toast } from "sonner";

export function Footer() {
  const { branding } = useTheme();
  const getFooter = useServerFn(getFooterContent);
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const loadBlocks = useServerFn(getSiteBlocks);
  const { data: blocks } = useQuery({ queryKey: ["site-blocks"], queryFn: () => loadBlocks() });
  const social = blocks?.social;
  const { data: content } = useQuery({
    queryKey: ["footer-content"],
    queryFn: () => getFooter(),
  });

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setIsSubscribing(true);
    try {
      await subscribe({ data: { email } });
      toast.success("Newsletter subscription confirmed");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Newsletter subscription failed");
    } finally {
      setIsSubscribing(false);
    }
  };

  const footer = content || {
    description: "Leading manufacturer of high-performance custom sportswear and activewear. Exporting excellence from Sialkot to the world.",
    copyright: "© 2026 Ambition Sports. All Rights Reserved.",
    newsletterTitle: "Newsletter",
    newsletterDescription: "Subscribe to get latest updates and new product launches."
  };

  return (
    <footer className="bg-card dark:bg-black border-t-2 border-primary pt-24 pb-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
        {/* Brand & Inquiry Info */}
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-4 group">
            {branding.logoUrl ? (
              <span className="inline-flex items-center justify-center p-2 rounded-2xl border-2 border-primary bg-white shadow-sm group-hover:shadow-md transition-all">
                <img src={branding.logoUrl} alt={branding.logoText} className="h-10 md:h-12 w-auto object-contain" />
              </span>
            ) : (
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground text-3xl">
                {branding.logoText?.[0] || 'A'}
              </div>
            )}
            <span className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">
              {branding.logoText.split(' ')[0]} <span className="text-primary">{branding.logoText.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>
          <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
            {footer.description}
          </p>
          {branding.showSocialIcons && (
            <div className="flex gap-4">
              {social?.facebook && <SocialIcon icon={<FaFacebook size={18} />} href={social.facebook} />}
              {social?.instagram && <SocialIcon icon={<FaInstagram size={18} />} href={social.instagram} />}
              {social?.twitter && <SocialIcon icon={<FaTwitter size={18} />} href={social.twitter} />}
              {social?.linkedin && <SocialIcon icon={<FaLinkedin size={18} />} href={social.linkedin} />}
              {social?.whatsapp && <SocialIcon icon={<FaWhatsapp size={18} />} href={social.whatsapp} />}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-primary">Quick Links</h4>
          <ul className="space-y-5 text-sm font-bold uppercase tracking-widest">
            <li><Link to="/sportswear" className="text-slate-700 dark:text-zinc-300 hover:text-primary transition-colors">Sportswear</Link></li>
            <li><Link to="/activewear" className="text-slate-700 dark:text-zinc-300 hover:text-primary transition-colors">Activewear</Link></li>
            <li><Link to="/customization" className="text-slate-700 dark:text-zinc-300 hover:text-primary transition-colors">Customization</Link></li>
            <li><Link to="/about" className="text-slate-700 dark:text-zinc-300 hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-slate-700 dark:text-zinc-300 hover:text-primary transition-colors">Contact & Quote</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-primary">Get In Touch</h4>
          <ul className="space-y-6 text-sm">
            <li className="flex gap-4 text-slate-600 dark:text-zinc-400 font-medium">
              <MapPin size={20} className="text-primary shrink-0" />
              <span>Industrial Estate, Sialkot, Pakistan 51310</span>
            </li>
            <li className="flex gap-4 text-slate-600 dark:text-zinc-400 font-medium">
              <Phone size={20} className="text-primary shrink-0" />
              <span>{branding.phone}</span>
            </li>
            <li className="flex gap-4 text-slate-600 dark:text-zinc-400 font-medium">
              <Mail size={20} className="text-primary shrink-0" />
              <span>{branding.email}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-primary">{footer.newsletterTitle}</h4>
          <p className="text-slate-600 dark:text-zinc-400 text-sm mb-8 font-medium leading-relaxed">
            {footer.newsletterDescription}
          </p>
          <form onSubmit={handleNewsletterSubmit} className="relative group">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="YOUR EMAIL"
              className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-5 pr-16 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-all group-hover:border-primary/50"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              aria-label="Subscribe to newsletter"
              className="absolute right-2 top-2 bottom-2 px-4 bg-primary rounded-lg text-white hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
        <p>{footer.copyright}</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href }: { icon: ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="w-12 h-12 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      {icon}
    </a>
  );
}
