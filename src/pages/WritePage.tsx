import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";

const WritePage = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="editorial-divider mb-4" />
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">SUBMIT</h1>
            <p className="font-body text-lg text-muted-foreground max-w-lg">
              Write and submit your engineering article. All submissions are reviewed by our editorial team.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="space-y-8">
            {/* Title */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                HEADLINE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your article title"
                className="w-full bg-transparent border border-border px-4 py-3 font-display text-2xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent border border-border px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary appearance-none"
              >
                <option value="">Select a category</option>
                {["Structures", "Energy", "Software", "Space", "Materials", "Infrastructure"].map(
                  (cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Body */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                BODY
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your article here..."
                rows={16}
                className="w-full bg-transparent border border-border px-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary resize-none leading-relaxed"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
              <button className="bg-primary text-primary-foreground font-mono text-[11px] uppercase tracking-[2px] px-8 py-3 brutalist-hover">
                SUBMIT FOR REVIEW
              </button>
              <button className="border border-foreground text-foreground font-mono text-[11px] uppercase tracking-[2px] px-8 py-3 brutalist-hover">
                SAVE DRAFT
              </button>
            </div>

            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
              All submissions are reviewed within 48 hours. Include citations where applicable.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WritePage;
