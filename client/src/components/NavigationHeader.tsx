import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_TITLE } from "@/const";
import { useEffect, useState } from "react";

interface NavigationHeaderProps {
  title?: string;
}

export default function NavigationHeader({ title }: NavigationHeaderProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLinkClick = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const getLinkClassName = (href: string) => {
    const isActive = location === href;
    return [
      "relative px-4 py-2 rounded-lg transition-all duration-300 ease-in-out",
      "transform hover:scale-105 hover:-translate-y-0.5 active:scale-95",
      "before:absolute before:inset-0 before:rounded-lg before:bg-primary/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      isActive
        ? "text-foreground font-semibold bg-primary/10 shadow-md"
        : "text-muted-foreground hover:text-primary hover:bg-accent/50",
    ].join(" ");
  };

  const navItems = [
    { href: "/", label: "首页" },
    { href: "/players", label: "选手" },
    { href: "/heroes", label: "英雄" },
    { href: "/matches", label: "比赛" },
  ];

  return (
    <>
      <header className="border-b border-border/50 bg-background/10 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                <img
                  src="/dota_logo.png"
                  alt="Dota 2 Logo"
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h1 className="text-3xl font-bold text-gradient group-hover:text-primary transition-all duration-300">
                {title || APP_TITLE}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <nav className="flex gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={getLinkClassName(item.href)}
                    onClick={handleLinkClick}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {location === item.href && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2 pl-4 border-l border-border/50">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group">
                      <Avatar className="h-8 w-8 border-2 border-primary/50 group-hover:border-primary transition-colors duration-300">
                        {user?.icon ? (
                          <img
                            src={user.icon}
                            alt={user.nickname}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <AvatarFallback
                          className="text-xs font-medium group-hover:bg-primary/20 transition-colors duration-300"
                          style={{ display: user?.icon ? 'none' : 'flex' }}
                        >
                          {user?.nickname?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium hidden sm:block group-hover:text-primary transition-colors duration-300">
                        {user?.nickname || "-"}
                      </p>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:rotate-180 transition-all duration-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user?.nickname || "-"}</p>
                      <p className="text-xs text-muted-foreground">{user?.username || "-"}</p>
                    </div>
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:text-destructive px-3 py-2 mt-2 focus:bg-destructive/10 transition-colors duration-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 页面切换过渡遮罩 */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300" />
      )}
    </>
  );
}
