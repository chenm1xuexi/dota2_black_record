import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Shield, Swords, Loader2 } from "lucide-react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/");
    },
    onError: (error: any) => {
      setError(error.message || "登录失败，请检查用户名和密码");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8">
      <style>
        {`
          @keyframes borderStream {
            0% { background-position: 0% 50%; }
            50% { background-position: 120% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}
      </style>
      {/* Dota 2 背景图片 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/login_map.jpg)',
          filter: 'brightness(1.0)',
        }}
      />
      {/* 火焰粒子特效 - 放在遮罩层之前，这样粒子会在遮罩层之上 */}
      <Particles
        id="tsparticles-fire"
        init={particlesInit}
        loaded={async (container) => {
          console.log("Particles loaded", container);
        }}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#ff6b00", "#ff8c00", "#ffa500", "#ffb347", "#ffcc99", "#ffd700", "#ffeb3b"],
            },
            links: {
              enable: false,
            },
            collisions: {
              enable: false,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "out",
              },
              random: true,
              speed: { min: 0.2, max: 0.8 },
              straight: false,
              attract: {
                enable: false,
              },
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 150,
            },
            opacity: {
              value: { min: 0.2, max: 0.6 },
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.1,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
              random: true,
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.5,
                sync: false,
              },
            },
            twinkle: {
              particles: {
                enable: true,
                frequency: 0.05,
                opacity: 1,
              },
            },
          },
          detectRetina: true,
          fullScreen: {
            enable: false,
          },
        }}
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* 动态遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/15 to-black/30 z-[1]" />

      {/* 主要内容 */}
      <div className="relative z-10 w-full max-w-md">
        {/* 登录表单 */}
        <Card className="bg-transparent border-transparent shadow-none">
          <CardContent className="p-8">
            {/* Logo 与标题 */}
            <div className="flex flex-col items-center justify-center text-center mb-8 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/dota2_logo.png"
                  alt="Dota 2 Logo"
                  className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(251,146,60,0.35)]"
                />
                <p className="text-4xl font-black tracking-wide bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,146,60,0.35)]">
                  DOTA2
                </p>
              </div>
              <p className="text-sm font-medium tracking-wide text-white/80 uppercase">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,200,87,0.35)]">
                  登录以进入战场
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group relative">
                <div
                className="rounded-xl p-[2px]"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(251,146,60,0.85), rgba(239,68,68,0.85), rgba(168,85,247,0.85), rgba(251,146,60,0.85))",
                    backgroundSize: "200% 200%",
                    animation: "borderStream 6s linear infinite",
                  }}
                >
                  <div className="relative flex items-center rounded-lg bg-black/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/40 group-hover:shadow-[0_0_18px_rgba(251,146,60,0.35)]">
                    <Swords className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-100 drop-shadow-[0_0_12px_rgba(251,191,36,0.45)] transition-transform duration-300 group-hover:scale-110" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入用户名"
                      className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-base tracking-wide text-white placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-0"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div
                className="rounded-xl p-[2px]"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(56,189,248,0.85), rgba(59,130,246,0.85), rgba(168,85,247,0.85), rgba(56,189,248,0.85))",
                    backgroundSize: "200% 200%",
                    animation: "borderStream 6s linear infinite",
                  }}
                >
                  <div className="relative flex items-center rounded-lg bg-black/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/40 group-hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] transition-transform duration-300 group-hover:scale-110" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="w-full h-12 bg-transparent border-none pl-12 pr-4 text-base tracking-wide text-white placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-0"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="relative w-full overflow-hidden bg-transparent border-none py-4 text-2xl font-black tracking-[1.15em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.55)] uppercase transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-300 hover:via-yellow-200 hover:to-amber-400 hover:drop-shadow-[0_0_40px_rgba(252,211,77,0.55)] focus-visible:ring-0 focus-visible:outline-none disabled:opacity-60"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 底部页脚 */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <p className="text-center text-white/60 text-sm font-medium tracking-wide">
          本项目 由 小飞飞 研发
        </p>
      </div>
    </div>
  );
}
