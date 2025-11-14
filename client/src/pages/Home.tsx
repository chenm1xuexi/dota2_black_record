import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Users, Trophy, Swords, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NavigationHeader from "@/components/NavigationHeader";

export default function Home() {
  const { data: dashboardStats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();

  const topHeroes = dashboardStats?.topHeroes || [];
  const playerWinRates = dashboardStats?.playerWinRates || [];

  // 按胜率降序排序热门英雄
  const sortedTopHeroes = topHeroes?.slice().sort((a: any, b: any) => b.winRate - a.winRate).slice(0, 10) || [];

  // 准备英雄胜率图表数据(按胜率降序)
  const heroWinRateData = sortedTopHeroes.map((hero: any) => ({
    name: hero.nameLoc || hero.heroName,
    胜率: parseFloat(hero.winRate.toFixed(1)),
    登场: hero.count
  }));

  // 准备选手胜率图表数据(前10名)
  const playerWinRateData = playerWinRates?.slice(0, 10).map((player: any) => ({
    name: player.playerNickname,
    胜率: parseFloat(player.winRate.toFixed(1)),
    场次: player.totalMatches
  })) || [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 首页背景图片 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/home_map.png)',
        }}
      />
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Dota 2 装饰性背景元素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 顶部光晕 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/15 to-red-500/10 blur-3xl" />
        {/* 底部光晕 */}
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-3xl" />
        {/* 神秘纹理 */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <NavigationHeader />

      <main className="container py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-transparent border-none shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">总比赛次</CardTitle>
                  <Trophy className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{dashboardStats?.totalMatches || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">已记录的对战数据</p>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">注册选手</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{dashboardStats?.totalPlayers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">活跃玩家数量</p>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">英雄池</CardTitle>
                  <Swords className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{dashboardStats?.totalHeroes || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">可选英雄数量</p>
                </CardContent>
              </Card>

              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">总场次</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {dashboardStats?.totalMatches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    天辉 {dashboardStats?.radiantWinRate?.toFixed(1) || '0.0'}% / 夜魇 {dashboardStats?.direWinRate?.toFixed(1) || '0.0'}%
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 选手胜率排行 */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                选手胜率排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : playerWinRates && playerWinRates.length > 0 ? (
                <div className="space-y-3">
                  {playerWinRates.slice(0, 10).map((player, index) => (
                    <div key={player.playerId} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      {player.playerIcon && (
                        <img
                          src={player.playerIcon}
                          alt={player.playerNickname}
                          className="w-8 h-8 rounded-full object-cover border border-primary/30"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{player.playerNickname}</span>
                          <span className="text-sm text-muted-foreground">
                            {player.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${player.winRate}%` }}
                          />
                        </div>
                        <div className="text-sm font-semibold mt-2 flex items-center gap-3">
                          <span className="text-emerald-300 drop-shadow-[0_0_6px_rgba(74,222,128,0.4)]">{player.wins}胜</span>
                          <span className="text-rose-300 drop-shadow-[0_0_6px_rgba(244,114,182,0.35)]">{player.totalMatches - player.wins}负</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* 热门英雄 Top 10 */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5" />
                热门英雄 Top 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : sortedTopHeroes.length > 0 ? (
                <div className="space-y-3">
                  {sortedTopHeroes.map((hero, index) => (
                    <div key={hero.heroId} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      {hero.icon && (
                        <img
                          src={hero.icon}
                          alt={hero.nameLoc || hero.heroName}
                          className="w-8 h-8 rounded object-cover border border-primary/30"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{hero.nameLoc || hero.heroName}</span>
                          <span className="text-sm text-muted-foreground">
                            {hero.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                              hero.winRate >= 50
                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                : 'bg-gradient-to-r from-red-500 to-rose-400'
                            }`}
                            style={{ width: `${hero.winRate}%` }}
                          />
                        </div>
                        <div className="text-sm font-semibold text-sky-300 mt-1 drop-shadow-[0_0_6px_rgba(56,189,248,0.35)]">
                          {hero.count}场
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visualization Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 英雄胜率分析 */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                英雄胜率分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : heroWinRateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={heroWinRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#f8fafc"
                      tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 600 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#f8fafc" tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="胜率" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">暂无数据</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 选手胜率可视化 */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                选手表现对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : playerWinRateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playerWinRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#f8fafc"
                      tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 600 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#f8fafc" tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="胜率" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">暂无数据</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Matches */}
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              最近比赛
            </CardTitle>
          </CardHeader>
          <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : dashboardStats?.recentMatches && dashboardStats.recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.recentMatches.map((match: any) => (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <div className={`relative p-5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        match.winnerSide === 'radiant' 
                          ? 'bg-gradient-to-r from-green-950/30 to-green-900/20 border-2 border-green-500/30 hover:border-green-400/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                          : 'bg-gradient-to-r from-red-950/30 to-red-900/20 border-2 border-red-500/30 hover:border-red-400/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                      }`}>
                        {/* 炫彩背景效果 */}
                        <div className={`absolute inset-0 opacity-10 ${
                          match.winnerSide === 'radiant'
                            ? 'bg-gradient-to-br from-green-400 via-transparent to-green-600'
                            : 'bg-gradient-to-br from-red-400 via-transparent to-red-600'
                        }`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
                              {new Date(match.matchDate).toLocaleDateString('zh-CN')}
                            </span>
                            <span className={`font-bold text-lg px-4 py-1 rounded-full ${
                              match.winnerSide === 'radiant' 
                                ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                                : 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                            }`}>
                              {match.winnerSide === 'radiant' ? '⚔️ 天辉胜利' : '⚔️ 夜魇胜利'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                <span className="text-green-400 font-bold text-base">天辉</span>
                              </div>
                              <div className="space-y-2 pl-5">
                                {match.participants?.filter((p: any) => p.teamSide === 'radiant').map((p: any) => (
                                  <div
                                    key={p.id}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                                      p.isMvp === 1
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30'
                                        : 'text-foreground/80 bg-background/10'
                                    }`}
                                  >
                                    {p.playerIcon && (
                                      <img
                                        src={p.playerIcon}
                                        alt={p.playerNickname}
                                        className="w-6 h-6 rounded-full object-cover border border-primary/30"
                                      />
                                    )}
                                    <span className="font-medium text-sm truncate">{p.playerNickname}</span>
                                    {p.heroIcon && (
                                      <img
                                        src={p.heroIcon}
                                        alt={p.nameLoc || p.heroName}
                                        className="w-6 h-6 rounded object-cover ml-auto flex-shrink-0"
                                      />
                                    )}
                                    {p.isMvp === 1 && (
                                      <span className="text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded px-1.5 py-0.5 ml-1">
                                        MVP
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                <span className="text-red-400 font-bold text-base">夜魇</span>
                              </div>
                              <div className="space-y-2 pl-5">
                                {match.participants?.filter((p: any) => p.teamSide === 'dire').map((p: any) => (
                                  <div
                                    key={p.id}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                                      p.isMvp === 1
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30'
                                        : 'text-foreground/80 bg-background/10'
                                    }`}
                                  >
                                    {p.playerIcon && (
                                      <img
                                        src={p.playerIcon}
                                        alt={p.playerNickname}
                                        className="w-6 h-6 rounded-full object-cover border border-destructive/30"
                                      />
                                    )}
                                    <span className="font-medium text-sm truncate">{p.playerNickname}</span>
                                    {p.heroIcon && (
                                      <img
                                        src={p.heroIcon}
                                        alt={p.nameLoc || p.heroName}
                                        className="w-6 h-6 rounded object-cover ml-auto flex-shrink-0"
                                      />
                                    )}
                                    {p.isMvp === 1 && (
                                      <span className="text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded px-1.5 py-0.5 ml-1">
                                        MVP
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无比赛数据</p>
              )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
