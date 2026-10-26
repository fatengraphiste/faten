import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MixedText } from "../components";
import { BEIGE, FONT, INK, RED, SAFE, WHITE } from "../theme";
import { AppIcon, BeigeBg, CL, Check, clamp } from "../cc/ui";

// Montage rythmé sur la musique (120 BPM → un temps = 15 frames)
export const S = {
  hook: 0,
  hand: 90,
  list: 180,
  claude: 330,
  modele: 420,
  idee: 540,
  steps: 600,
  step2: 690,
  step3: 790,
  cta: 870,
};
export const FAIT_DURATION = 1020; // 34 s

const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, damping = 11) => spring({ frame: frame - at, fps, config: { damping } });
};

const RedBg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: RED, fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
    {children}
  </AbsoluteFill>
);

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 40 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap, padding: `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`, textAlign: "center" }}>
    {children}
  </AbsoluteFill>
);

// ---------- 1. Accroche ----------
const Hook: React.FC = () => {
  const p = usePop();
  const frame = useCurrentFrame();
  const shake = frame > 60 && frame < 75 ? Math.sin(frame * 2.4) * 10 : 0;
  return (
    <RedBg>
      <Center>
        <div style={{ transform: `scale(${p(3)})` }}>
          <MixedText text="الـ vidéo هذي" size={130} color={BEIGE} />
        </div>
        <div
          style={{
            backgroundColor: BEIGE,
            borderRadius: 30,
            padding: "10px 50px",
            transform: `scale(${p(30, 8)}) rotate(${-6 + shake / 3}deg) translateX(${shake}px)`,
          }}
        >
          <MixedText text="ما عملتهاش أنا" size={104} color={RED} />
        </div>
      </Center>
    </RedBg>
  );
};

// ---------- 2. « ولا حتى كلمة وحدة بيدي » ----------
const Hand: React.FC = () => {
  const p = usePop();
  const words = ["ولا", "حتى", "كلمة", "وحدة", "بيدي"];
  return (
    <BeigeBg>
      <Center>
        <div dir="rtl" style={{ maxWidth: 860 }}>
          {words.map((w, i) => {
            const s = p(5 + i * 12, 10);
            const last = i === words.length - 1;
            return (
              <span key={w} style={{ display: "inline-block", margin: "0 14px", opacity: s, transform: `translateY(${(1 - s) * 60}px) scale(${s})` }}>
                <MixedText
                  text={w}
                  size={last ? 150 : 120}
                  color={last ? WHITE : INK}
                  style={last ? { backgroundColor: RED, borderRadius: 26, padding: "0 30px" } : undefined}
                />
              </span>
            );
          })}
        </div>
      </Center>
    </BeigeBg>
  );
};

// ---------- 3. Texte / Animation / Transition / Effets sonores ----------
const List: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop();
  const T = [15, 45, 75, 105];
  const typed = "Texte".slice(0, Math.floor(interpolate(frame, [T[0], T[0] + 12], [0, 5], clamp)));
  const bounce = spring({ frame: frame - T[1], fps: 30, config: { damping: 4, stiffness: 160 } });
  const wipe = interpolate(frame, [T[2], T[2] + 14], [0, 100], clamp);
  const style: React.CSSProperties = { fontSize: 92, fontWeight: 800, color: BEIGE, lineHeight: 1.15 };
  return (
    <RedBg>
      <Center gap={30}>
        <div style={style}>
          {typed}
          {frame >= T[0] && frame < T[1] && Math.floor(frame / 6) % 2 ? "|" : ""}
        </div>
        <div style={{ ...style, opacity: frame >= T[1] ? 1 : 0, transform: `scale(${bounce}) rotate(${(1 - bounce) * -20}deg)` }}>
          Animation
        </div>
        <div style={{ ...style, clipPath: `inset(0 ${100 - wipe}% 0 0)`, position: "relative" }}>
          Transition
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe}%`, width: 14, backgroundColor: WHITE, opacity: wipe < 100 ? 1 : 0 }} />
        </div>
        <div style={{ ...style, display: "flex", alignItems: "center", gap: 26, opacity: p(T[3]), transform: `translateY(${(1 - p(T[3])) * 40}px)` }}>
          Effets sonores
          <div style={{ display: "flex", gap: 8, alignItems: "center", height: 90 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: 12, borderRadius: 6, backgroundColor: BEIGE, height: 20 + 60 * Math.abs(Math.sin(frame / 4 + i * 1.3)) }} />
            ))}
          </div>
        </div>
      </Center>
    </RedBg>
  );
};

// ---------- 4. « كلها خدمها Claude » ----------
const ClaudeDid: React.FC = () => {
  const p = usePop();
  const logo = p(25, 9);
  return (
    <BeigeBg>
      <Center gap={50}>
        <div style={{ transform: `scale(${p(4)})` }}>
          <MixedText text="كلها خدمها" size={120} color={INK} />
        </div>
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -180}deg)` }}>
          <AppIcon name="claude" size={340} />
        </div>
        <div style={{ fontSize: 130, fontWeight: 800, color: RED, transform: `scale(${p(40, 9)})` }}>Claude</div>
      </Center>
    </BeigeBg>
  );
};

// ---------- 5. « عطيتو modèle وكتبت اعمل كيفو » ----------
const Modele: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop();
  const msg = "اعمل كيفو";
  const typed = msg.slice(0, Math.floor(interpolate(frame, [45, 75], [0, msg.length], clamp)));
  const sent = frame >= 82;
  return (
    <BeigeBg>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.left, right: SAFE.right, textAlign: "center", transform: `scale(${p(4)})` }}>
        <MixedText text="عطيتو modèle" size={96} color={INK} latinColor={RED} />
        <div style={{ marginTop: 10, opacity: p(40) }}>
          <MixedText text="وكتبتلو باش يعمل كيفو" size={60} color={INK} />
        </div>
      </div>
      {/* Mini interface Claude */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: SAFE.left,
          right: SAFE.right,
          height: 1920 - SAFE.bottom - 600,
          borderRadius: 36,
          backgroundColor: CL.bg,
          border: `2px solid ${CL.border}`,
          boxShadow: "0 30px 80px rgba(42,15,14,0.18)",
          transform: `translateY(${(1 - p(0, 15)) * 500}px)`,
        }}
      >
        {/* Pièce jointe : la vidéo modèle */}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 40,
            width: 260,
            height: 360,
            borderRadius: 24,
            backgroundColor: RED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${p(12, 10)})`,
            transformOrigin: "right top",
          }}
        >
          <svg width={110} height={110} viewBox="0 0 24 24">
            <path d="M8 5 L19 12 L8 19 Z" fill={BEIGE} />
          </svg>
          <div style={{ position: "absolute", bottom: 20, fontSize: 30, fontWeight: 800, color: BEIGE }}>modèle.mp4</div>
        </div>
        {sent ? (
          <div
            dir="rtl"
            style={{ position: "absolute", right: 40, top: 420, padding: "18px 30px", borderRadius: 24, backgroundColor: "#f0eee6", transform: `scale(${p(82, 12)})`, transformOrigin: "right top" }}
          >
            <MixedText text={msg} size={44} color={CL.text} />
          </div>
        ) : null}
        <div
          dir="rtl"
          style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 120, borderRadius: 26, border: `2px solid ${CL.border}`, backgroundColor: WHITE, padding: "26px 30px", textAlign: "right" }}
        >
          {!sent && typed ? (
            <MixedText text={typed + (Math.floor(frame / 8) % 2 ? "|" : "")} size={44} color={CL.text} />
          ) : (
            <span style={{ fontSize: 32, color: CL.muted }}>Répondre…</span>
          )}
        </div>
      </div>
    </BeigeBg>
  );
};

// ---------- 6. « من فكرة للتصميم » ----------
const Idee: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop();
  const line = interpolate(frame, [14, 30], [0, 1], clamp);
  return (
    <RedBg>
      <Center gap={30}>
        <div style={{ transform: `scale(${p(2)})` }}>
          <MixedText text="من فكرة" size={130} color={BEIGE} />
        </div>
        <svg width={40} height={220 * line + 1} viewBox={`0 0 40 ${220 * line + 1}`}>
          <path d={`M20 0 V${Math.max(0, 220 * line - 20)}`} stroke={BEIGE} strokeWidth={8} strokeLinecap="round" />
          {line > 0.9 ? <path d={`M6 ${220 * line - 30} L20 ${220 * line - 10} L34 ${220 * line - 30}`} stroke={BEIGE} strokeWidth={8} fill="none" strokeLinecap="round" /> : null}
        </svg>
        <div style={{ transform: `scale(${p(30, 9)})`, backgroundColor: BEIGE, borderRadius: 30, padding: "0 50px" }}>
          <MixedText text="للتصميم" size={130} color={RED} />
        </div>
      </Center>
    </RedBg>
  );
};

// ---------- 7. Les 3 étapes ----------
const StepHead: React.FC<{ n: number; text: string; at: number }> = ({ n, text, at }) => {
  const p = usePop();
  const s = p(at);
  return (
    <div style={{ position: "absolute", top: SAFE.top + 30, left: SAFE.left, right: SAFE.right, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})` }}>
      <div style={{ width: 130, height: 130, borderRadius: 99, backgroundColor: RED, color: WHITE, fontSize: 70, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {n}
      </div>
      <MixedText text={text} size={84} color={INK} latinColor={RED} />
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; at: number }> = ({ children, at }) => {
  const p = usePop();
  return (
    <div
      style={{
        position: "absolute",
        top: 760,
        left: SAFE.left + 10,
        right: SAFE.right + 10,
        borderRadius: 36,
        backgroundColor: WHITE,
        padding: 50,
        boxShadow: "0 30px 70px rgba(42,15,14,0.15)",
        transform: `translateY(${(1 - p(at, 14)) * 400}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Steps: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop();
  const t2 = S.step2 - S.steps;
  const t3 = S.step3 - S.steps;
  const chips = ["Texte", "Plans", "Transitions", "Son"];
  const idea = "Un reel pour ma marque";
  const progress = interpolate(frame, [t3 + 10, t3 + 60], [0, 100], clamp);
  return (
    <BeigeBg>
      {frame < t2 ? (
        <>
          <StepHead n={1} text="شنوة تحب تعمل ؟" at={0} />
          <Card at={6}>
            <div style={{ fontSize: 48, fontWeight: 600, color: INK }}>
              {idea.slice(0, Math.floor(interpolate(frame, [20, 55], [0, idea.length], clamp)))}
              <span style={{ color: RED }}>{Math.floor(frame / 8) % 2 ? "|" : ""}</span>
            </div>
          </Card>
        </>
      ) : frame < t3 ? (
        <>
          <StepHead n={2} text="وصف الفكرة بالتفصيل" at={t2} />
          <Card at={t2 + 4}>
            <div style={{ fontSize: 36, fontWeight: 800, color: RED, letterSpacing: 4, marginBottom: 30 }}>PROMPT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {chips.map((c, i) => {
                const s = p(t2 + 15 + i * 15, 9);
                return (
                  <div key={c} style={{ fontSize: 50, fontWeight: 800, color: WHITE, backgroundColor: RED, borderRadius: 999, padding: "12px 40px", transform: `scale(${s})` }}>
                    {c}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : (
        <>
          <StepHead n={3} text="Rendu مع Claude" at={t3} />
          <Card at={t3 + 4}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <AppIcon name="claude" size={110} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: INK }}>{progress < 100 ? "Rendu en cours…" : "Vidéo prête"}</div>
                <div style={{ height: 22, borderRadius: 99, backgroundColor: `${RED}22`, marginTop: 18, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, backgroundColor: RED, borderRadius: 99 }} />
                </div>
              </div>
              <div style={{ width: 90, height: 90, borderRadius: 99, backgroundColor: progress >= 100 ? RED : `${RED}22`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${progress >= 100 ? p(t3 + 60, 7) : 1})` }}>
                {progress >= 100 ? <Check size={56} /> : <span style={{ fontSize: 28, fontWeight: 800, color: RED }}>{Math.floor(progress)}%</span>}
              </div>
            </div>
          </Card>
        </>
      )}
    </BeigeBg>
  );
};

// ---------- 8. Appel à l'action ----------
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop();
  const swatches = [RED, "#7a1328", "#00c4cc", "#8b3dff"];
  const sw = Math.floor(Math.max(0, frame - 85) / 8) % swatches.length;
  return (
    <RedBg>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: SAFE.top, paddingLeft: SAFE.left, paddingRight: SAFE.right, gap: 40 }}>
        <div style={{ transform: `scale(${p(2)})` }}>
          <MixedText text="تحب تجرب ؟" size={120} color={BEIGE} />
        </div>
        {/* Lien à copier */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, backgroundColor: BEIGE, borderRadius: 999, padding: "20px 40px", transform: `scale(${p(30)})` }}>
          <svg width={50} height={50} viewBox="0 0 24 24">
            <rect x={8} y={8} width={12} height={12} rx={2} stroke={RED} strokeWidth={2.2} fill="none" />
            <path d="M16 8 V5 Q16 4 15 4 H5 Q4 4 4 5 V15 Q4 16 5 16 H8" stroke={RED} strokeWidth={2.2} fill="none" />
          </svg>
          <MixedText text="copie lien الـ vidéo" size={54} color={INK} latinColor={RED} />
        </div>
        <div style={{ transform: `scale(${p(60)})` }}>
          <MixedText text="وقلو : اعمل كيفو" size={72} color={BEIGE} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${p(85)})` }}>
          <MixedText text="بدل texte و couleurs" size={64} color={BEIGE} />
          <div style={{ width: 70, height: 70, borderRadius: 99, backgroundColor: swatches[sw], border: `6px solid ${BEIGE}` }} />
        </div>
        <div style={{ transform: `scale(${p(115, 9)}) rotate(-3deg)`, backgroundColor: BEIGE, borderRadius: 30, padding: "6px 50px" }}>
          <MixedText text="و partagi معانا" size={84} color={RED} />
        </div>
        <Img src={staticFile("logo-creofan-complet.png")} style={{ width: 420, marginTop: 20, opacity: p(125) }} />
      </AbsoluteFill>
    </RedBg>
  );
};

type Sfx = "whoosh" | "pop" | "click" | "typing" | "ding";
const SFX: [Sfx, number, number?][] = [
  ["pop", 3], ["ding", 30],
  ["whoosh", S.hand - 4], ...[0, 1, 2, 3, 4].map((i) => ["pop", S.hand + 5 + i * 12] as [Sfx, number]),
  ["whoosh", S.list - 4], ["typing", S.list + 15, 12], ["pop", S.list + 45], ["whoosh", S.list + 75], ["pop", S.list + 105],
  ["whoosh", S.claude - 4], ["pop", S.claude + 4], ["ding", S.claude + 25],
  ["whoosh", S.modele - 4], ["pop", S.modele + 12], ["typing", S.modele + 45, 30], ["click", S.modele + 82],
  ["whoosh", S.idee - 4], ["pop", S.idee + 2], ["pop", S.idee + 30],
  ["whoosh", S.steps - 4], ["typing", S.steps + 20, 35],
  ["whoosh", S.step2 - 2], ...[0, 1, 2, 3].map((i) => ["pop", S.step2 + 15 + i * 15] as [Sfx, number]),
  ["whoosh", S.step3 - 2], ["ding", S.step3 + 60],
  ["whoosh", S.cta - 4], ["pop", S.cta + 2], ["click", S.cta + 30], ["pop", S.cta + 60], ["pop", S.cta + 85], ["ding", S.cta + 115],
];

export const FaitParClaude: React.FC = () => {
  const scenes: [number, number, React.FC][] = [
    [S.hook, S.hand, Hook],
    [S.hand, S.list, Hand],
    [S.list, S.claude, List],
    [S.claude, S.modele, ClaudeDid],
    [S.modele, S.idee, Modele],
    [S.idee, S.steps, Idee],
    [S.steps, S.cta, Steps],
    [S.cta, FAIT_DURATION, Cta],
  ];
  return (
    <>
      {scenes.map(([from, to, Scene], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          <ScenePunch>
            <Scene />
          </ScenePunch>
        </Sequence>
      ))}
      <Audio
        src={staticFile("cc/music.mp3")}
        volume={(f) => interpolate(f, [0, 10, FAIT_DURATION - 40, FAIT_DURATION], [0, 0.6, 0.6, 0], clamp)}
      />
      {SFX.map(([name, at, len], i) => (
        <Sequence key={`s${i}`} from={at} durationInFrames={len ?? 30}>
          <Audio src={staticFile(`cc/${name}.wav`)} volume={name === "whoosh" ? 0.5 : 0.7} />
        </Sequence>
      ))}
    </>
  );
};

// Petit zoom d'entrée à chaque coupe
const ScenePunch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18, mass: 0.6 } });
  return <AbsoluteFill style={{ transform: `scale(${interpolate(s, [0, 1], [1.12, 1])})` }}>{children}</AbsoluteFill>;
};
