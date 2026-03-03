import Ticker from "@/components/Ticker";

const Hero = () => {
  return (
    <>
      <section className="relative w-full min-h-[85vh] flex items-end noise-overlay grid-overlay pt-14">
        <div className="relative z-10 container mx-auto px-4 pb-20">
          <div className="max-w-4xl space-y-6">
            <div className="editorial-divider" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Engineering Journalism
            </p>
            <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] text-foreground">
              BUILD.<br />REPORT.<br />THINK.
            </h1>
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Uzbekiston's first student-run engineering publication. We cover structures, energy, software, space, and the systems that shape our world.
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="/explore"
                className="inline-flex bg-primary text-primary-foreground font-mono text-[11px] uppercase tracking-[2px] px-6 py-3 brutalist-hover"
              >
                READ NOW
              </a>
              <a
                href="/write"
                className="inline-flex border border-foreground text-foreground font-mono text-[11px] uppercase tracking-[2px] px-6 py-3 brutalist-hover"
              >
                SUBMIT WORK
              </a>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl">
            {[
              { value: "43%", label: "of bridges over 50 years old" },
              { value: "$125B", label: "repair backlog" },
              { value: "0", label: "high school pubs covering this beat" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl md:text-5xl text-primary">{stat.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Ticker />
    </>
  );
};

export default Hero;
