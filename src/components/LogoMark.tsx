const LogoMark = ({ size = 20 }: { size?: number }) => {
  const s = size / 2;
  return (
    <div className="inline-grid grid-cols-2 gap-[2px]" style={{ width: size, height: size }}>
      <div className="border border-foreground" style={{ width: s - 1, height: s - 1 }} />
      <div className="bg-foreground" style={{ width: s - 1, height: s - 1 }} />
      <div className="bg-foreground/40" style={{ width: s - 1, height: s - 1 }} />
      <div className="border border-foreground/30" style={{ width: s - 1, height: s - 1 }} />
    </div>
  );
};

export default LogoMark;
