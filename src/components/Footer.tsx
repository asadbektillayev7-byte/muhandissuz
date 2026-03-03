import LogoMark from "@/components/LogoMark";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LogoMark size={18} />
              <span className="font-display text-lg tracking-[6px] text-foreground">MUHANDISS</span>
              <span className="text-primary text-xs font-mono">.UZ</span>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed max-w-xs">
              Uzbekiston's first student-run engineering journalism platform. Built by high school students who think in systems.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-[0.15em] text-foreground mb-4">NAVIGATE</h4>
            <div className="space-y-2">
              {[
                { label: "Explore", href: "/explore" },
                { label: "Submit", href: "/write" },
                { label: "About", href: "/loyiha-haqida" },
                { label: "Team", href: "/jamoa" },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-[0.15em] text-foreground mb-4">CATEGORIES</h4>
            <div className="space-y-2">
              {["Structures", "Energy", "Software", "Space", "Materials", "Infrastructure"].map((cat) => (
                <span
                  key={cat}
                  className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            © {new Date().getFullYear()} MUHANDISS.UZ
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Built by Students
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
