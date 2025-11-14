import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trophy, TrendingUp, Users, Target, Swords } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/NavigationHeader";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function HeroDetail() {
  const params = useParams<{ id: string }>();
  const heroId = parseInt(params.id);

  const { data: hero, isLoading: heroLoading } = trpc.heroes.getById.useQuery({ id: heroId });
  const { data: stats, isLoading: statsLoading } = trpc.heroes.stats.useQuery({ id: heroId });
  const { data: playerStats, isLoading: playerStatsLoading } = trpc.heroes.playerStats.useQuery({ id: heroId });

  if (heroLoading) {
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

  if (!hero) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">英雄不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationHeader />

      {/* Hero Info Header */}
      <div className="border-b border-border/50 bg-background/10 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Link href="/heroes">
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{hero.nameLoc || hero.name}</h1>
              {hero.nameEnglishLoc && hero.nameLoc !== hero.nameEnglishLoc && (
                <p className="text-sm text-muted-foreground">{hero.nameEnglishLoc}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 英雄大图展示 */}
          <Card className="bg-background/10 overflow-hidden border-0 shadow-2xl">
            <div className="relative h-[500px] bg-gradient-to-br from-primary/10 via-background to-primary/5">
              {hero.topImg ? (
                <>
                  <img
                    src={hero.topImg}
                    alt={hero.nameLoc || hero.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </>
              ) : hero.indexImg ? (
                <>
                  <img
                    src={hero.indexImg}
                    alt={hero.nameLoc || hero.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
              )}

              {/* 英雄信息覆盖层 */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-4xl">
                  <div className="flex items-end gap-6 mb-4">
                    <div className="flex-1">
                      <h1 className="text-5xl font-black mb-3 tracking-tight">
                        {hero.nameLoc || hero.name}
                      </h1>
                      {hero.nameEnglishLoc && hero.nameLoc !== hero.nameEnglishLoc && (
                        <p className="text-2xl text-muted-foreground font-light mb-4">{hero.nameEnglishLoc}</p>
                      )}
                      {hero.primaryAttr !== undefined && (
                        <Badge variant="secondary" className="text-base px-4 py-2 h-auto">
                          {hero.primaryAttr === 0 ? '力量' : hero.primaryAttr === 1 ? '敏捷' : hero.primaryAttr === 2 ? '智力' : hero.primaryAttr === 3 ? '全才' : '未知'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 基本信息与统计 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 基本信息 */}
            <Card className="lg:col-span-1 bg-background/10">
              <CardHeader>
                <CardTitle className="text-xl">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {hero.name && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">英文名</p>
                    <p className="text-base font-medium">{hero.name}</p>
                  </div>
                )}
                {hero.primaryAttr !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">主属性</p>
                    <Badge variant="secondary" className="text-sm">
                      {hero.primaryAttr === 0 ? '力量' : hero.primaryAttr === 1 ? '敏捷' : hero.primaryAttr === 2 ? '智力' : hero.primaryAttr === 3 ? '全才' : '未知'}
                    </Badge>
                  </div>
                )}
                {hero.hypeLoc && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">宣传语</p>
                    <p className="text-base italic">{hero.hypeLoc}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 统计数据 */}
            <Card className="lg:col-span-2 bg-background/10">
              <CardHeader>
                <CardTitle className="text-xl">使用统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">总比赛</p>
                    <p className="text-3xl font-bold text-primary">{stats?.totalMatches || 0}</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-green-500/5">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">胜率</p>
                    <p className="text-3xl font-bold text-green-500">
                      {stats?.winRate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-blue-500/5">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">登场率</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {stats?.pickRate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-orange-500/5">
                    <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">胜/负</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {stats?.wins || 0}/{stats?.losses || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 胜败比例图 */}
          {stats && stats.totalMatches > 0 && (
            <Card className="bg-background/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  胜败分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '胜利', value: stats.wins, color: '#10b981' },
                          { name: '失败', value: stats.losses, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: '胜利', value: stats.wins, color: '#10b981' },
                          { name: '失败', value: stats.losses, color: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 英雄背景 */}
          {(hero.bioLoc || hero.npeDescLoc) && (
            <Card className="bg-background/10">
              <CardHeader>
                <CardTitle className="text-xl">英雄背景</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hero.bioLoc && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">背景故事</h3>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{hero.bioLoc}</p>
                  </div>
                )}
                {hero.npeDescLoc && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">NPE 描述</h3>
                    <p className="text-foreground leading-relaxed">{hero.npeDescLoc}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 玩家使用排行 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                玩家使用排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerStatsLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : playerStats && playerStats.length > 0 ? (
                <div className="space-y-3">
                  {playerStats.slice(0, 20).map((player: any, index: number) => (
                    <div key={player.playerId} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-base truncate">{player.playerNickname}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{player.count} 场</span>
                            <span className="text-xl font-bold text-green-500">
                              {player.winRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${player.winRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">暂无玩家使用数据</p>
              )}
            </CardContent>
          </Card>

          {/* 玩家胜率可视化 */}
          {playerStats && playerStats.length > 0 && (
            <Card className="bg-background/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  胜率分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={playerStats.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="playerNickname"
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
