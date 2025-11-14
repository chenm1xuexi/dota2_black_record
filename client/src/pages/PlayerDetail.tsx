import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trophy, TrendingUp, Users, Swords, Target, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/NavigationHeader";

export default function PlayerDetail() {
  const params = useParams<{ id: string }>();
  const playerId = parseInt(params.id);

  const { data: player, isLoading: playerLoading } = trpc.players.getById.useQuery({ id: playerId });
  const { data: stats, isLoading: statsLoading } = trpc.players.stats.useQuery({ id: playerId });
  const { data: heroStats, isLoading: heroStatsLoading } = trpc.players.heroStats.useQuery({ id: playerId });
  const { data: rivals, isLoading: rivalsLoading } = trpc.players.rivals.useQuery({ id: playerId });

  if (playerLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">选手不存在</p>
      </div>
    );
  }

  const avatarSrc = player.icon || null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/player_map.jpg)',
        }}
      />
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Dota 2 装饰性背景元素 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/15 to-red-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-3xl" />
      </div>
      <div className="relative z-10">
      {/* Header */}
      <NavigationHeader />

      {/* Player Info Header */}
      <div className="border-b border-border/50 bg-background/10 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center gap-6">
            <Link href="/players">
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={player.nickname}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <AvatarFallback className="text-2xl font-bold" style={{ display: avatarSrc ? 'none' : 'flex' }}>
                  {player.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{player.nickname}</h1>
                <p className="text-muted-foreground">@{player.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 基本信息卡片 */}
          <Card className="bg-background/10">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">MMR段位</p>
                  <p className="text-xl font-semibold">{player.mmrRank || "未设置"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">心理评分</p>
                  <p className="text-xl font-semibold">{player.mentalScore}/100</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">擅长位置</p>
                  <div className="flex gap-2 flex-wrap">
                    {player.preferredPositions?.split(',').map((pos, idx) => (
                      <Badge key={idx} variant="secondary">
                        位置 {pos}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {player.bio && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">个人简介</p>
                  <p className="text-foreground">{player.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-background/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">总比赛场次</CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.totalMatches || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-background/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">胜率</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {stats?.winRate?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.wins}胜 {stats?.losses}负
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MVP次数</CardTitle>
                <Award className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {stats?.recentMatches?.filter((m: any) => m.isMvp === 1).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 英雄使用统计 */}
          <Card className="bg-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5" />
                英雄使用统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heroStatsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : heroStats && heroStats.length > 0 ? (
                <div className="space-y-3">
                  {heroStats.map((hero, index) => (
                    <div key={hero.heroId} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-lg">{hero.nameLoc || hero.heroName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{hero.count} 场</span>
                            <span className="text-lg font-bold text-green-500">
                              {hero.winRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${hero.winRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无英雄使用数据</p>
              )}
            </CardContent>
          </Card>

          {/* 英雄胜率可视化 */}
          {heroStats && heroStats.length > 0 && (
            <Card className="bg-background/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  英雄胜率可视化
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={heroStats.slice(0, 10).map(h => ({
                      ...h,
                      displayName: h.nameLoc || h.heroName
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="displayName"
                      stroke="#888"
                      tick={{ fill: '#888', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#888" tick={{ fill: '#888' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="winRate" fill="#10b981" name="胜率 %" />
                    <Bar dataKey="count" fill="#3b82f6" name="使用次数" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 苦主对手 */}
          <Card className="bg-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                苦主对手 (胜率最低的5位)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rivalsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : rivals && rivals.length > 0 ? (
                <div className="space-y-3">
                  {rivals.map((rival, index) => (
                    <div key={rival.playerId} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-500 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-lg">{rival.playerNickname}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{rival.matches} 场</span>
                            <span className="text-lg font-bold text-red-500">
                              {rival.winRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-rose-400"
                            style={{ width: `${rival.winRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无对手数据</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
