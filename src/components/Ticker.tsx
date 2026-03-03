const Ticker = ({ text }: { text?: string }) => {
  const defaultText = "Engineering Journalism · Built by Students · Real Stories · Real Science · The Future Is Now";
  const content = text || defaultText;
  const repeated = `${content} · ${content} · ${content} · `;

  return (
    <div className="w-full overflow-hidden border-y border-border bg-background py-3">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-[13px] font-mono uppercase tracking-[0.15em] text-foreground/[0.13]">
          {repeated}
        </span>
      </div>
    </div>
  );
};

export default Ticker;
