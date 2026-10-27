import type { Slide, Template } from "@ls/schema";

/**
 * Placeholder visuals, drawn from the slide's description in the lesson's template
 * colors. Real generated media replaces these once the demo cache exists (M8).
 */
type Kind = "haystack" | "basket" | "lines" | "receipt" | "phone" | "bumpy" | "recap" | "chloro" | "tree" | "membrane" | "cycle" | "generic";

const RULES: [RegExp, Kind][] = [
  [/haystack|needle/i, "haystack"], [/basket|tiles flowing/i, "basket"], [/growth lines|drift apart/i, "lines"],
  [/receipt/i, "receipt"], [/phone/i, "phone"], [/bumpy|dip/i, "bumpy"], [/recap|logo/i, "recap"],
  [/oak|tree/i, "tree"], [/cycle|calvin|fixation|reduction|regeneration|rubp/i, "cycle"],
  [/membrane|thylakoid|photosystem|electron|water molecule|light arriving/i, "membrane"], [/chloroplast|leaf/i, "chloro"],
];

export const artKind = (s: Slide): Kind => RULES.find(([re]) => re.test(s.visual))?.[1] ?? "generic";

function Art({ kind, t }: { kind: Kind; t: Template["colors"] }) {
  const serif = "Georgia, serif";
  switch (kind) {
    case "haystack": return <svg width="260" height="150" viewBox="0 0 260 150" aria-hidden="true"><path d="M30 140 Q130 -10 230 140 Z" fill="#E9C46A" /><path d="M60 140 Q130 30 200 140" fill="none" stroke="#D4A84B" strokeWidth="3" /><path d="M95 140 Q130 60 165 140" fill="none" stroke="#D4A84B" strokeWidth="3" /><line x1="150" y1="80" x2="178" y2="62" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><circle cx="180" cy="61" r="4" fill="#fff" /></svg>;
    case "basket": return <svg width="300" height="150" viewBox="0 0 300 150" aria-hidden="true"><g fill={t.primary}>{[10, 40, 70].flatMap((y) => [10, 52].map((x) => <rect key={`${x}${y}`} x={x} y={y} width="34" height="22" rx="5" />))}</g><path d="M100 50 H170" stroke={t.secondary} strokeWidth="4" strokeLinecap="round" /><path d="M160 40 L172 50 L160 60" fill="none" stroke={t.secondary} strokeWidth="4" strokeLinecap="round" /><path d="M190 40 H290 L278 130 H202 Z" fill={t.accent} /></svg>;
    case "lines": return <svg width="320" height="160" viewBox="0 0 320 160" aria-hidden="true"><line x1="10" y1="150" x2="310" y2="150" stroke={t.secondary} strokeWidth="2" /><polyline points="10,140 80,120 150,90 220,55 300,15" fill="none" stroke={t.primary} strokeWidth="6" strokeLinecap="round" /><polyline points="10,140 80,125 150,105 220,85 300,60" fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round" /></svg>;
    case "receipt": return <svg width="200" height="160" viewBox="0 0 200 160" aria-hidden="true"><path d="M30 5 H170 V155 L155 145 L140 155 L125 145 L110 155 L95 145 L80 155 L65 145 L50 155 L30 145 Z" fill="#fff" /><g stroke="#C9D3D6" strokeWidth="6" strokeLinecap="round"><line x1="50" y1="30" x2="150" y2="30" /><line x1="50" y1="55" x2="130" y2="55" /><line x1="50" y1="105" x2="140" y2="105" /></g><rect x="42" y="70" width="116" height="22" rx="4" fill="#F4C7B8" /><line x1="50" y1="81" x2="150" y2="81" stroke={t.accent} strokeWidth="6" strokeLinecap="round" /></svg>;
    case "phone": return <svg width="260" height="170" viewBox="0 0 260 170" aria-hidden="true"><rect x="20" y="10" width="90" height="150" rx="14" fill={t.secondary} /><rect x="30" y="28" width="70" height="110" rx="6" fill="#fff" /><rect x="42" y="70" width="46" height="24" rx="6" fill={t.primary} /><g fill={t.accent}>{[[140, 20], [170, 40], [200, 22], [150, 70], [185, 90], [220, 66], [160, 120], [205, 130]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="22" height="16" rx="4" />)}</g></svg>;
    case "bumpy": return <svg width="320" height="160" viewBox="0 0 320 160" aria-hidden="true"><polyline points="10,140 50,110 80,125 120,80 150,120 190,70 230,95 270,40 310,20" fill="none" stroke={t.primary} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" /><circle cx="150" cy="120" r="12" fill="none" stroke={t.accent} strokeWidth="4" /><text x="150" y="152" textAnchor="middle" fontSize="16" fontWeight="800" fill={t.accent}>hold on</text></svg>;
    case "recap": return <div style={{ display: "flex", flexDirection: "column", gap: 8, fontWeight: 700, fontSize: 20, color: "#F4A261" }}><span>1. Buy the haystack</span><span>2. Keep costs low</span><span>3. Stay in</span></div>;
    case "chloro": return <svg width="300" height="170" viewBox="0 0 300 170" aria-hidden="true"><ellipse cx="150" cy="85" rx="140" ry="75" fill="#CFE8B9" stroke="#3F7A2B" strokeWidth="4" /><g fill="#5E9E3B" stroke="#2F6020" strokeWidth="2"><rect x="80" y="55" width="30" height="60" rx="7" /><rect x="125" y="45" width="30" height="80" rx="7" /><rect x="170" y="58" width="30" height="54" rx="7" /></g><line x1="140" y1="45" x2="220" y2="15" stroke={t.text} strokeWidth="1.5" /><text x="224" y="18" fontSize="14" fill={t.text} fontFamily={serif}>granum</text><line x1="230" y1="90" x2="268" y2="120" stroke={t.text} strokeWidth="1.5" /><text x="232" y="140" fontSize="14" fill={t.text} fontFamily={serif}>stroma</text></svg>;
    case "tree": return <svg width="220" height="190" viewBox="0 0 220 190" aria-hidden="true"><rect x="98" y="110" width="24" height="76" fill="#7A5230" /><circle cx="110" cy="80" r="62" fill="#5E9E3B" /><circle cx="68" cy="100" r="38" fill="#4E8A30" /><circle cx="152" cy="100" r="38" fill="#4E8A30" /><text x="110" y="90" textAnchor="middle" fontSize="48" fill="#fff" fontFamily={serif}>?</text></svg>;
    case "membrane": return <svg width="320" height="170" viewBox="0 0 320 170" aria-hidden="true"><rect x="20" y="70" width="280" height="40" rx="20" fill="#A9D18E" stroke="#3F7A2B" strokeWidth="3" /><g stroke={t.accent} strokeWidth="4" strokeLinecap="round"><line x1="60" y1="10" x2="90" y2="62" /><line x1="110" y1="10" x2="140" y2="62" /></g><g fontFamily={serif} fontSize="16" fill={t.text}><text x="200" y="40">ATP</text><text x="250" y="40">NADPH</text><text x="40" y="150">H₂O</text><text x="110" y="150">O₂</text></g></svg>;
    case "cycle": return <svg width="280" height="190" viewBox="0 0 280 190" aria-hidden="true"><circle cx="140" cy="95" r="70" fill="none" stroke={t.text} strokeWidth="4" strokeDasharray="120 26" /><g fontFamily={serif} fontSize="15" fill={t.text} textAnchor="middle"><text x="140" y="16">1. Fixation</text><text x="245" y="150">2. Reduction</text><text x="40" y="150">3. Regeneration</text></g><text x="140" y="100" textAnchor="middle" fontFamily={serif} fontSize="18" fill="#B8902E">CO₂</text></svg>;
    default: return <svg width="240" height="140" viewBox="0 0 240 140" aria-hidden="true"><rect x="20" y="30" width="80" height="80" rx="14" fill={t.primary} /><circle cx="160" cy="70" r="44" fill={t.accent} opacity="0.85" /></svg>;
  }
}

const TINTS = ["", "#EADBC2", "#DCEFEA", "#F3D9CF", "#E4E7F7"];

/** One video frame: art, headline and caption on the template background. */
export function VideoFrame({ slide, template, version = 1, caption, compact }: { slide: Slide; template: Template; version?: number; caption?: string; compact?: boolean }) {
  const kind = artKind(slide);
  const dark = kind === "recap" || slide.role === "cta";
  const bg = version > 1 ? TINTS[(version - 1) % TINTS.length] : dark ? template.colors.secondary : template.colors.background;
  const fg = dark && version === 1 ? "#F4A261" : template.colors.text;
  return (
    <div role="img" aria-label={`Slide ${slide.order}: ${slide.title}`} style={{ background: bg, color: fg, aspectRatio: "16 / 9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: compact ? 4 : 14, padding: compact ? 6 : 24, textAlign: "center", overflow: "hidden" }}>
      {compact ? <div style={{ transform: "scale(0.3)", height: 40, display: "flex", alignItems: "center" }}><Art kind={kind} t={template.colors} /></div> : <Art kind={kind} t={template.colors} />}
      {!compact && <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 1.2, fontFamily: `${template.fonts.heading}, var(--font)` }}>{slide.title}</div>}
      {!compact && caption && <div style={{ fontSize: 16, opacity: 0.85, maxWidth: 560 }}>{caption}</div>}
    </div>
  );
}

/** One lecture slide in the deck template. */
export function DeckSlide({ slide, template, courseLabel, version = 1, cite, compact }: { slide: Slide; template: Template; courseLabel: string; version?: number; cite?: string; compact?: boolean }) {
  const c = template.colors;
  const isTitle = slide.role === "title";
  const scale = compact ? 0.28 : 1;
  return (
    <div role="img" aria-label={`Slide ${slide.order}: ${slide.title}`} style={{ aspectRatio: "16 / 9", background: version > 1 ? TINTS[(version - 1) % TINTS.length] : c.background, border: `1px solid #E3E6EC`, borderRadius: compact ? 6 : 10, overflow: "hidden", display: "flex", flexDirection: "column", color: c.text }}>
      <div style={{ background: c.primary, color: "#fff", padding: `${14 * scale}px ${22 * scale}px`, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        {compact ? <span style={{ height: 6 }} /> : <span style={{ fontFamily: template.fonts.heading + ", Georgia, serif", fontSize: isTitle ? 30 : 24, fontWeight: 600 }}>{slide.title}</span>}
        {!compact && <span style={{ fontSize: 13, color: c.accent }}>{courseLabel}</span>}
      </div>
      {!compact && (
        <div style={{ flex: 1, display: "flex", gap: 20, padding: "18px 22px", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, fontSize: 17, lineHeight: 1.45 }}>
            {slide.bullets.map((b) => <div key={b} style={{ display: "flex", gap: 10 }}><span aria-hidden="true" style={{ color: c.accent }}>•</span><span>{b}</span></div>)}
          </div>
          {!isTitle && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Art kind={artKind(slide)} t={c} />
              {slide.visualType === "generated_clip" && <span className="tag">Clip · plays in class</span>}
            </div>
          )}
        </div>
      )}
      {!compact && (
        <div style={{ borderTop: `2px solid ${c.accent}`, padding: "8px 22px", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5A6272" }}>
          <span>{cite ? `Source: ${cite}` : ""}</span><span>{slide.order}</span>
        </div>
      )}
    </div>
  );
}
