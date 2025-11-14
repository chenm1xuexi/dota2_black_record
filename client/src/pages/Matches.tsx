import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Plus, ArrowLeft, Calendar, Trash2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";
import NavigationHeader from "@/components/NavigationHeader";

export default function Matches() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: matchesData, isLoading, refetch } = trpc.matches.list.useQuery();
  const matches = matchesData?.matches || [];
  const { data: players } = trpc.players.list.useQuery({});
  const { data: heroes } = trpc.heroes.list.useQuery({});
  const createMutation = trpc.matches.create.useMutation();
  const deleteMutation = trpc.matches.delete.useMutation();

  const [formData, setFormData] = useState({
    matchDate: new Date().toISOString().split('T')[0],
    winnerSide: 'radiant' as 'radiant' | 'dire',
    radiantTeam: Array(5).fill({ playerId: 0, playerNickname: '', heroId: 0, isMvp: 0 }),
    direTeam: Array(5).fill({ playerId: 0, playerNickname: '', heroId: 0, isMvp: 0 }),
  });

  const resetForm = () => {
    setFormData({
      matchDate: new Date().toISOString().split('T')[0],
      winnerSide: 'radiant',
      radiantTeam: Array(5).fill({ playerId: 0, playerNickname: '', heroId: 0, isMvp: 0 }),
      direTeam: Array(5).fill({ playerId: 0, playerNickname: '', heroId: 0, isMvp: 0 }),
    });
    setCurrentStep(1);
  };

  const updateTeamMember = (team: 'radiant' | 'dire', index: number, field: string, value: any) => {
    const teamKey = team === 'radiant' ? 'radiantTeam' : 'direTeam';
    const newTeam = [...formData[teamKey]];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setFormData({ ...formData, [teamKey]: newTeam });
  };

  const handleCreate = async () => {
    try {
      const participants = [
        ...formData.radiantTeam.map((p, i) => ({ ...p, teamSide: 'radiant' as const, position: i + 1 })),
        ...formData.direTeam.map((p, i) => ({ ...p, teamSide: 'dire' as const, position: i + 1 })),
      ];

      if (participants.some(p => !p.playerId || !p.heroId)) {
        toast.error("请为所有选手选择英雄");
        return;
      }

      await createMutation.mutateAsync({
        matchDate: formData.matchDate,
        winnerSide: formData.winnerSide,
        participants,
      });

      toast.success("比赛创建成功");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("创建失败: " + (error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingMatchId) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingMatchId });
      toast.success("比赛删除成功");
      setDeletingMatchId(null);
      refetch();
    } catch (error) {
      toast.error("删除失败: " + (error as Error).message);
    }
  };

  const TeamForm = ({ team, teamName }: { team: 'radiant' | 'dire'; teamName: string }) => {
    const teamData = team === 'radiant' ? formData.radiantTeam : formData.direTeam;

    return (
      <div className="space-y-6">
        <h3 className={`text-xl font-bold ${team === 'radiant' ? 'radiant-text' : 'dire-text'}`}>
          {teamName}
        </h3>
        {teamData.map((member, index) => (
          <div key={index} className="border border-border rounded-xl p-6 space-y-4 bg-card/30 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{index + 1}号位</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={member.isMvp === 1}
                  onChange={(e) => updateTeamMember(team, index, 'isMvp', e.target.checked ? 1 : 0)}
                  className="w-5 h-5 rounded border border-input bg-background"
                />
                <Label className="text-base cursor-pointer">MVP</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">选手</Label>
                <Select
                  value={member.playerId?.toString() || ""}
                  onValueChange={(value) => {
                    const playerId = parseInt(value);
                    const selectedPlayer = players?.find(p => p.id === playerId);
                    const teamKey = team === 'radiant' ? 'radiantTeam' : 'direTeam';
                    const newTeam = [...formData[teamKey]];
                    newTeam[index] = {
                      ...newTeam[index],
                      playerId,
                      playerNickname: selectedPlayer?.nickname || ''
                    };
                    setFormData({ ...formData, [teamKey]: newTeam });
                  }}
                >
                <SelectTrigger className="h-12 w-full text-base bg-background">
                    <SelectValue placeholder="选择选手" />
                  </SelectTrigger>
                  <SelectContent>
                    {players?.map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.nickname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">英雄</Label>
                <Select
                  value={member.heroId?.toString() || ""}
                  onValueChange={(value) => {
                    const heroId = parseInt(value);
                    const teamKey = team === 'radiant' ? 'radiantTeam' : 'direTeam';
                    const newTeam = [...formData[teamKey]];
                    newTeam[index] = {
                      ...newTeam[index],
                      heroId,
                    };
                    setFormData({ ...formData, [teamKey]: newTeam });
                  }}
                >
                <SelectTrigger className="h-12 w-full text-base bg-background">
                    <SelectValue placeholder="选择英雄" />
                  </SelectTrigger>
                  <SelectContent>
                    {heroes?.map((hero) => (
                      <SelectItem key={hero.id} value={hero.id.toString()}>
                        {hero.nameLoc || hero.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/heros_map.jpg)',
        }}
      />
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Header */}
      <NavigationHeader />

      <main className="container py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">比赛列表</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                创建比赛
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94vw] sm:w-[90vw] sm:max-w-[90vw] lg:w-[80vw] lg:max-w-[80vw] xl:w-[75vw] xl:max-w-[75vw] max-h-[95vh] overflow-y-auto bg-background/90 backdrop-blur-md px-8 py-6">
              {/* 背景图片 */}
              <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-70 pointer-events-none"
                style={{
                  backgroundImage: 'url(/player_map.jpg)',
                  zIndex: -1,
                }}
              />
              <DialogHeader className="pb-4">
                <DialogTitle className="text-3xl">创建新比赛</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">填写比赛信息和选择双方阵容</DialogDescription>
              </DialogHeader>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/20 p-6 rounded-lg">
                  <div>
                    <Label htmlFor="matchDate" className="text-base mb-2 block font-semibold">比赛日期</Label>
                    <Input
                      id="matchDate"
                      type="date"
                      value={formData.matchDate}
                      onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                      className="h-12 text-base bg-background"
                    />
                  </div>

                  <div>
                    <Label htmlFor="winnerSide" className="text-base mb-2 block font-semibold">获胜方</Label>
                    <Select
                      value={formData.winnerSide}
                      onValueChange={(value: 'radiant' | 'dire') => setFormData({ ...formData, winnerSide: value })}
                    >
                  <SelectTrigger className="h-12 w-full text-base bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radiant">天辉</SelectItem>
                        <SelectItem value="dire">夜魇</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <TeamForm team="radiant" teamName="天辉阵容" />
                  <TeamForm team="dire" teamName="夜魇阵容" />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "创建中..." : "创建比赛"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => {
              const radiantTeam = match.participants.filter(p => p.teamSide === 'radiant');
              const direTeam = match.participants.filter(p => p.teamSide === 'dire');
              
              return (
                <Card
                  key={match.id}
                  className="transition-all duration-200 hover:shadow-lg bg-background/10 cursor-pointer"
                  onClick={() => window.location.href = `/matches/${match.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            {new Date(match.matchDate).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </CardTitle>
                          <div className={`text-sm font-bold mt-1 ${match.winnerSide === 'radiant' ? 'radiant-text' : 'dire-text'}`}>
                            {match.winnerSide === 'radiant' ? '天辉胜利' : '夜魇胜利'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingMatchId(match.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${match.winnerSide === 'radiant' ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/30'}`}>
                        <div className="font-bold radiant-text mb-3">天辉</div>
                        <div className="space-y-3">
                          {radiantTeam.map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                p.isMvp === 1
                                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 shadow-md'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex-shrink-0">
                                {p.position}
                              </div>
                              {p.playerIcon && (
                                <img
                                  src={p.playerIcon}
                                  alt={p.playerNickname}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate flex items-center gap-2">
                                  {p.playerNickname}
                                  {p.isMvp === 1 && match.winnerSide === 'radiant' && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded">
                                      MVP
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {p.nameLoc || p.heroName || ''}
                                </div>
                              </div>
                              {p.heroIcon && (
                                <img
                                  src={p.heroIcon}
                                  alt={p.nameLoc || p.heroName || ''}
                                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg ${match.winnerSide === 'dire' ? 'bg-red-500/10 border border-red-500/30' : 'bg-muted/30'}`}>
                        <div className="font-bold dire-text mb-3">夜魇</div>
                        <div className="space-y-3">
                          {direTeam.map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                                p.isMvp === 1 && match.winnerSide === 'dire'
                                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 shadow-md'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/20 text-destructive font-bold text-sm flex-shrink-0">
                                {p.position}
                              </div>
                              {p.playerIcon && (
                                <img
                                  src={p.playerIcon}
                                  alt={p.playerNickname}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-destructive/30"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate flex items-center gap-2">
                                  {p.playerNickname}
                                  {p.isMvp === 1 && match.winnerSide === 'dire' && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded">
                                      MVP
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {p.nameLoc || p.heroName || ''}
                                </div>
                              </div>
                              {p.heroIcon && (
                                <img
                                  src={p.heroIcon}
                                  alt={p.nameLoc || p.heroName || ''}
                                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-background/10">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">暂无比赛数据</p>
              <Button className="mt-4 gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                创建第一场比赛
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={!!deletingMatchId} onOpenChange={(open) => !open && setDeletingMatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这场比赛吗?此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
