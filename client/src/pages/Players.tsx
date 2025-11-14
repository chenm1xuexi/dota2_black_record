import { useState, useCallback, memo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Search, Plus, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";
import NavigationHeader from "@/components/NavigationHeader";

interface PlayerFormProps {
  formData: any;
  editingPlayer: any;
  handleInputChange: (field: string, value: any) => void;
  togglePosition: (position: string) => void;
}

// 将PlayerForm提取为独立组件，使用memo防止不必要的重渲染
const PlayerForm = memo(({ formData, editingPlayer, handleInputChange, togglePosition }: PlayerFormProps) => {
  // 为每个dialog实例生成唯一的前缀，避免id冲突
  const prefix = editingPlayer ? 'edit' : 'create';
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${prefix}-nickname`}>昵称 *</Label>
        <Input
          id={`${prefix}-nickname`}
          value={formData.nickname}
          onChange={(e) => handleInputChange('nickname', e.target.value)}
          placeholder="输入选手昵称"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor={`${prefix}-username`}>用户名 *</Label>
        <Input
          id={`${prefix}-username`}
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="输入登录用户名"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor={`${prefix}-password`}>密码 {editingPlayer ? "(留空则不修改)" : "*"}</Label>
        <Input
          id={`${prefix}-password`}
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="输入密码"
          autoComplete="new-password"
        />
      </div>

      <div>
        <Label>游戏段位</Label>
        <Select value={formData.mmrRank} onValueChange={(value) => handleInputChange('mmrRank', value)}>
          <SelectTrigger>
            <SelectValue placeholder="选择段位" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="先锋">先锋</SelectItem>
            <SelectItem value="卫士">卫士</SelectItem>
            <SelectItem value="中军">中军</SelectItem>
            <SelectItem value="统幅">统幅</SelectItem>
            <SelectItem value="传奇">传奇</SelectItem>
            <SelectItem value="万古流芳">万古流芳</SelectItem>
            <SelectItem value="冠绝一世">冠绝一世</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>选择头像</Label>
        <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
          <SelectTrigger>
            <SelectValue placeholder="选择头像" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={`/avatars/avatar-${num}.png`}>
                <div className="flex items-center gap-2">
                  <img src={`/avatars/avatar-${num}.png`} alt={`头像 ${num}`} className="w-6 h-6 rounded-full" />
                  头像 {num}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.icon && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">当前选择:</span>
            <img src={formData.icon} alt="当前头像" className="w-10 h-10 rounded-full border-2 border-primary" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor={`${prefix}-mentalScore`}>心态值</Label>
          <span className="text-sm font-bold text-primary">{formData.mentalScore}</span>
        </div>
        <input
          id={`${prefix}-mentalScore`}
          type="range"
          min="0"
          max="100"
          value={formData.mentalScore}
          onChange={(e) => handleInputChange('mentalScore', parseInt(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, oklch(var(--primary)) 0%, oklch(var(--primary)) ${formData.mentalScore}%, oklch(var(--secondary)) ${formData.mentalScore}%, oklch(var(--secondary)) 100%)`
          }}
        />
      </div>

      <div>
        <Label>擅长位置</Label>
        <div className="flex gap-2">
          {['1', '2', '3', '4', '5'].map((pos) => (
            <Label
              key={pos}
              htmlFor={`${prefix}-pos-${pos}`}
              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-accent"
            >
              <Checkbox
                id={`${prefix}-pos-${pos}`}
                checked={formData.preferredPositions.includes(pos)}
                onCheckedChange={() => togglePosition(pos)}
              />
              {pos}号位
            </Label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor={`${prefix}-bio`}>个人简介</Label>
        <Textarea
          id={`${prefix}-bio`}
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="输入个人简介"
          rows={3}
          autoComplete="off"
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有当formData实际变化时才重新渲染
  const prevFormData = prevProps.formData;
  const nextFormData = nextProps.formData;

  // 检查editingPlayer是否变化
  const editingPlayerChanged = prevProps.editingPlayer?.id !== nextProps.editingPlayer?.id;

  // 检查formData是否有实际变化
  const formDataChanged =
    prevFormData.nickname !== nextFormData.nickname ||
    prevFormData.username !== nextFormData.username ||
    prevFormData.password !== nextFormData.password ||
    prevFormData.mmrRank !== nextFormData.mmrRank ||
    prevFormData.icon !== nextFormData.icon ||
    prevFormData.mentalScore !== nextFormData.mentalScore ||
    prevFormData.bio !== nextFormData.bio ||
    JSON.stringify(prevFormData.preferredPositions) !== JSON.stringify(nextFormData.preferredPositions);

  // 如果editingPlayer或formData没有实际变化，则不重新渲染
  return !editingPlayerChanged && !formDataChanged;
});

export default function Players() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);

  const { data: players, isLoading, refetch } = trpc.players.list.useQuery({ search });
  const createMutation = trpc.players.create.useMutation();
  const updateMutation = trpc.players.update.useMutation();
  const deleteMutation = trpc.players.delete.useMutation();

  const [formData, setFormData] = useState({
    nickname: "",
    username: "",
    password: "",
    bio: "",
    mmrRank: "",
    mentalScore: 50,
    preferredPositions: [] as string[],
    icon: "/avatars/avatar-1.png",
  });

  const resetForm = () => {
    setFormData({
      nickname: "",
      username: "",
      password: "",
      bio: "",
      mmrRank: "",
      mentalScore: 50,
      preferredPositions: [],
      icon: "/avatars/avatar-1.png",
    });
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        preferredPositions: formData.preferredPositions.join(','),
      });
      toast.success("选手创建成功");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("创建失败: " + (error as Error).message);
    }
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    setFormData({
      nickname: player.nickname,
      username: player.username,
      password: "",
      bio: player.bio || "",
      mmrRank: player.mmrRank || "",
      mentalScore: player.mentalScore || 50,
      preferredPositions: player.preferredPositions ? player.preferredPositions.split(',') : [],
      icon: player.icon || "/avatars/avatar-1.png",
    });
  };

  const handleUpdate = async () => {
    if (!editingPlayer) return;
    try {
      await updateMutation.mutateAsync({
        id: editingPlayer.id,
        ...formData,
        preferredPositions: formData.preferredPositions.join(','),
        password: formData.password || undefined,
      });
      toast.success("选手更新成功");
      setEditingPlayer(null);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("更新失败: " + (error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingPlayerId) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingPlayerId });
      toast.success("选手删除成功");
      setDeletingPlayerId(null);
      refetch();
    } catch (error) {
      toast.error("删除失败: " + (error as Error).message);
    }
  };

  const togglePosition = useCallback((position: string) => {
    setFormData(prev => ({
      ...prev,
      preferredPositions: prev.preferredPositions.includes(position)
        ? prev.preferredPositions.filter(p => p !== position)
        : [...prev.preferredPositions, position]
    }));
  }, []);

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

      {/* Header */}
      <NavigationHeader />

      <main className="container py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">选手列表</h2>
          <Dialog
            key="create-player-dialog"
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                添加选手
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新选手</DialogTitle>
                <DialogDescription>填写选手信息以创建新的选手档案</DialogDescription>
              </DialogHeader>
              <PlayerForm
                formData={formData}
                editingPlayer={null}
                handleInputChange={handleInputChange}
                togglePosition={togglePosition}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "创建中..." : "创建"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索选手昵称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-background/50">
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent>
              </Card>
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <Card
                key={player.id}
                className="bg-background/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                onClick={() => window.location.href = `/players/${player.id}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {player.icon && (
                        <img
                          src={player.icon}
                          alt={player.nickname}
                          className="w-10 h-10 rounded-full border-2 border-primary/50 object-cover"
                        />
                      )}
                      <span>{player.nickname}</span>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(player)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingPlayerId(player.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                  {player.mmrRank && (
                    <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded w-fit">
                      {player.mmrRank}
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {player.preferredPositions && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">擅长位置:</span>
                        <div className="flex gap-1">
                          {player.preferredPositions.split(',').map((pos) => (
                            <span key={pos} className="position-badge">{pos}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {player.mentalScore !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">心态值:</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${player.mentalScore}%`,
                              backgroundColor: player.mentalScore >= 70 ? '#10b981' :
                                              player.mentalScore >= 40 ? '#3b82f6' :
                                              '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{player.mentalScore}</span>
                      </div>
                    )}

                    {player.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{player.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-background/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">暂无选手数据</p>
              <Button className="mt-4 gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                添加第一个选手
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog
        key={`edit-player-dialog-${editingPlayer?.id || 'none'}`}
        open={!!editingPlayer}
        onOpenChange={(open) => !open && setEditingPlayer(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑选手信息</DialogTitle>
            <DialogDescription>修改选手的档案信息</DialogDescription>
          </DialogHeader>
          <PlayerForm
            formData={formData}
            editingPlayer={editingPlayer}
            handleInputChange={handleInputChange}
            togglePosition={togglePosition}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlayer(null)}>取消</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPlayerId} onOpenChange={(open) => !open && setDeletingPlayerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个选手吗?此操作无法撤销。
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
