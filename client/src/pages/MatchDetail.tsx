import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react";
import { APP_TITLE } from "@/const";
import NavigationHeader from "@/components/NavigationHeader";

export default function MatchDetail() {
  const [, params] = useRoute("/matches/:id");
  const matchId = params?.id ? parseInt(params.id) : 0;

  const { data: match, isLoading } = trpc.matches.details.useQuery({ id: matchId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container py-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">比赛不存在</p>
              <Link href="/matches">
                <Button className="mt-4">返回比赛列表</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const radiantTeam = (match.participants || []).filter(p => p.teamSide === 'radiant');
  const direTeam = (match.participants || []).filter(p => p.teamSide === 'dire');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationHeader />

      {/* Match Info Header */}
      <div className="border-b border-border/50 bg-background/10 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Link href="/matches">
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                比赛详情
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date(match.matchDate).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {/* 比赛基本信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Calendar className="h-6 w-6" />
              {new Date(match.matchDate).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Trophy className={`h-8 w-8 ${match.winnerSide === 'radiant' ? 'radiant-text' : 'dire-text'}`} />
              <div>
                <div className="text-sm text-muted-foreground">获胜方</div>
                <div className={`text-2xl font-bold ${match.winnerSide === 'radiant' ? 'radiant-text' : 'dire-text'}`}>
                  {match.winnerSide === 'radiant' ? '天辉' : '夜魇'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 双方阵容 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 天辉阵容 */}
          <Card className={match.winnerSide === 'radiant' ? 'border-green-500/50 bg-green-500/5' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 radiant-text">
                <Users className="h-5 w-5" />
                天辉阵容
                {match.winnerSide === 'radiant' && <Trophy className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {radiantTeam.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      participant.isMvp === 1
                        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 shadow-md'
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-lg flex-shrink-0">
                      {participant.position}
                    </div>
                    {participant.playerIcon && (
                      <img
                        src={participant.playerIcon}
                        alt={participant.playerNickname}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/50 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/players/${participant.playerId}`}>
                          <span className="font-bold hover:text-primary transition-colors cursor-pointer truncate">
                            {participant.playerNickname}
                          </span>
                        </Link>
                        {participant.isMvp === 1 && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded">
                            MVP
                          </span>
                        )}
                      </div>
                      <Link href={`/heroes/${participant.heroId}`}>
                        <div className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                          {participant.nameLoc || participant.heroName || ''}
                        </div>
                      </Link>
                    </div>
                    {participant.heroIcon && (
                      <img
                        src={participant.heroIcon}
                        alt={participant.nameLoc || participant.heroName || ''}
                        className="w-14 h-14 rounded object-cover border-2 border-primary/30 flex-shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 夜魇阵容 */}
          <Card className={match.winnerSide === 'dire' ? 'border-red-500/50 bg-red-500/5' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dire-text">
                <Users className="h-5 w-5" />
                夜魇阵容
                {match.winnerSide === 'dire' && <Trophy className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {direTeam.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      participant.isMvp === 1
                        ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 shadow-md'
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/20 text-destructive font-bold text-lg flex-shrink-0">
                      {participant.position}
                    </div>
                    {participant.playerIcon && (
                      <img
                        src={participant.playerIcon}
                        alt={participant.playerNickname}
                        className="w-12 h-12 rounded-full object-cover border-2 border-destructive/50 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/players/${participant.playerId}`}>
                          <span className="font-bold hover:text-primary transition-colors cursor-pointer truncate">
                            {participant.playerNickname}
                          </span>
                        </Link>
                        {participant.isMvp === 1 && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded">
                            MVP
                          </span>
                        )}
                      </div>
                      <Link href={`/heroes/${participant.heroId}`}>
                        <div className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                          {participant.nameLoc || participant.heroName || ''}
                        </div>
                      </Link>
                    </div>
                    {participant.heroIcon && (
                      <img
                        src={participant.heroIcon}
                        alt={participant.nameLoc || participant.heroName || ''}
                        className="w-14 h-14 rounded object-cover border-2 border-destructive/30 flex-shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
