"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const GOLD = "#d4a017";
const GOLD2 = "#f0c040";

// Floating particle component
function Particle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}60, transparent)`,
        animation: `float ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: "none",
      }}
    />
  );
}

// Orbiting ring
function OrbitRing({ radius, duration, color, opacity }: any) {
  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        border: `1px solid ${color}`,
        borderRadius: "50%",
        opacity,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        animation: `spin ${duration}s linear infinite`,
      }}
    />
  );
}

export default function LoginPage() {
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const particles = [
    { x: 15, y: 20, size: 3, delay: 0 }, { x: 80, y: 15, size: 2, delay: 1.2 },
    { x: 65, y: 70, size: 4, delay: 0.7 }, { x: 30, y: 80, size: 2, delay: 2 },
    { x: 90, y: 50, size: 3, delay: 1.5 }, { x: 10, y: 55, size: 2, delay: 0.3 },
    { x: 50, y: 10, size: 3, delay: 1.8 }, { x: 75, y: 88, size: 2, delay: 0.9 },
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: qErr } = await supabase
        .from("users")
        .select("*")
        .eq("national_id", nationalId)
        .eq("password_hash", password)
        .single();
      if (qErr || !data) {
        setError("رقم الهوية أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }
      localStorage.setItem("rifa_user", JSON.stringify(data));
      window.location.href =
        data.role === "teacher" ? "/teacher" : data.role === "admin" ? "/admin" : "/student";
    } catch {
      setError("حدث خطأ، يرجى المحاولة مجدداً");
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#04060a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(212,160,23,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow center */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        background: "radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      {/* Top glow bar */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity: 0.6,
      }} />

      {/* Floating particles */}
      {mounted && particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Orbit rings */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", opacity: 0.15 }}>
        <OrbitRing radius={220} duration={25} color={GOLD} opacity={1} />
        <OrbitRing radius={300} duration={40} color={GOLD} opacity={0.6} />
        <OrbitRing radius={380} duration={60} color={GOLD} opacity={0.3} />
      </div>

      {/* Main card */}
      <div
        style={{
          width: "100%", maxWidth: 440, padding: "0 1rem",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
          position: "relative", zIndex: 10,
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {/* Animated logo */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: 24,
                background: "linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.05))",
                border: `1px solid rgba(212,160,23,0.4)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 900, color: GOLD,
                boxShadow: `0 0 40px rgba(212,160,23,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
                position: "relative",
                animation: "pulse-gold 3s infinite",
              }}
            >
              ر
              {/* Inner glow */}
              <div style={{
                position: "absolute", inset: -1,
                borderRadius: 24,
                background: "linear-gradient(135deg, rgba(212,160,23,0.15), transparent)",
                pointerEvents: "none",
              }} />
            </div>
            {/* Orbiting dot */}
            <div style={{
              position: "absolute", width: 8, height: 8,
              background: GOLD2, borderRadius: "50%",
              top: "50%", left: "50%",
              animation: "orbit 4s linear infinite",
              boxShadow: `0 0 10px ${GOLD}`,
            }} />
          </div>

          <h1 style={{
            fontSize: 26, fontWeight: 900, color: "#f0f4ff",
            letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            مدرسة الرفعة
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <span style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: "0.1em" }}>
              النموذجية ٢٠٢٦
            </span>
            <div style={{ height: 1, width: 30, background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "rgba(15,25,41,0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,160,23,0.2)",
            borderRadius: 24,
            padding: "2rem",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top shimmer */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)`,
          }} />

          {/* Corner accents */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60,
            background: `radial-gradient(circle at top right, rgba(212,160,23,0.1), transparent)`,
            pointerEvents: "none"
          }} />

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#f0f4ff" }}>تسجيل الدخول</h2>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
              مرحباً — أدخل بياناتك للوصول إلى المنصة
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* National ID */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: "0.08em" }}>
                رقم الهوية الوطنية
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  fontSize: 16, opacity: 0.5, pointerEvents: "none",
                }}>🪪</div>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  onFocus={() => setFocused("id")}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="1234567890"
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 1rem",
                    fontSize: 14,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    color: "#f0f4ff",
                    background: "rgba(12,18,32,0.8)",
                    border: `1px solid ${focused === "id" ? GOLD : "rgba(212,160,23,0.15)"}`,
                    borderRadius: 14,
                    outline: "none",
                    direction: "rtl",
                    transition: "all 0.2s",
                    boxShadow: focused === "id" ? `0 0 0 3px rgba(212,160,23,0.15)` : "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: "0.08em" }}>
                كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  fontSize: 16, opacity: 0.5, pointerEvents: "none",
                }}>🔑</div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                    fontSize: 14,
                    fontFamily: "'Cairo', sans-serif",
                    color: "#f0f4ff",
                    background: "rgba(12,18,32,0.8)",
                    border: `1px solid ${focused === "pass" ? GOLD : "rgba(212,160,23,0.15)"}`,
                    borderRadius: 14,
                    outline: "none",
                    direction: "ltr",
                    textAlign: "right",
                    transition: "all 0.2s",
                    boxShadow: focused === "pass" ? `0 0 0 3px rgba(212,160,23,0.15)` : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, opacity: 0.5, color: "#94a3b8",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "0.75rem 1rem",
                background: "rgba(255,77,109,0.1)",
                border: "1px solid rgba(255,77,109,0.3)",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                color: "#ff4d6d",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                marginTop: 8,
                fontSize: 15,
                fontWeight: 900,
                fontFamily: "'Cairo', sans-serif",
                color: "#04060a",
                background: loading
                  ? "rgba(212,160,23,0.4)"
                  : `linear-gradient(135deg, ${GOLD2} 0%, ${GOLD} 100%)`,
                border: "none",
                borderRadius: 14,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(212,160,23,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transform: "translateY(0)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.01)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)",
                    borderTopColor: "#04060a", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  جاري الدخول...
                </>
              ) : (
                <>
                  <span>دخول إلى المنصة</span>
                  <span style={{ fontSize: 16 }}>←</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom separator */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: 10, color: "#1e293b", textAlign: "center", fontWeight: 700, letterSpacing: "0.1em" }}>
              © 2026 مدرسة الرفعة النموذجية — جميع الحقوق محفوظة
            </p>
          </div>
        </div>

        {/* Role badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "طالب", icon: "🎓", color: "#3b9eff" },
            { label: "معلم", icon: "📚", color: GOLD },
            { label: "مدير", icon: "🏫", color: "#10d9a0" },
          ].map(r => (
            <div key={r.label} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "0.3rem 0.75rem",
              background: `${r.color}10`,
              border: `1px solid ${r.color}25`,
              borderRadius: 999,
              fontSize: 11, fontWeight: 700, color: r.color,
            }}>
              <span>{r.icon}</span> {r.label}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-gold {
          0%,100%{box-shadow:0 0 40px rgba(212,160,23,0.2),inset 0 1px 0 rgba(255,255,255,0.1)}
          50%{box-shadow:0 0 60px rgba(212,160,23,0.4),0 0 0 8px rgba(212,160,23,0.05),inset 0 1px 0 rgba(255,255,255,0.1)}
        }
        @keyframes orbit {
          from{transform:rotate(0deg) translateX(45px) rotate(0deg)}
          to{transform:rotate(360deg) translateX(45px) rotate(-360deg)}
        }
      `}</style>
    </div>
  );
}
