import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, ArrowLeft } from "lucide-react";
import { APP_TITLE } from "@/const";
import NavigationHeader from "@/components/NavigationHeader";

export default function Heroes() {
  const [search, setSearch] = useState("");

  const { data: heroes, isLoading } = trpc.heroes.list.useQuery({ search });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationHeader />

      <main className="container py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">英雄列表</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索英雄..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="bg-background/10">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent>
                </Card>
              ))}
            </div>
          ) : heroes && heroes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {heroes.map((hero) => (
                <Card
                  key={hero.id}
                  className="bg-background/10 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden cursor-pointer"
                  onClick={() => window.location.href = `/heroes/${hero.id}`}
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                    {hero.indexImg ? (
                      <img
                        src={hero.indexImg}
                        alt={hero.nameLoc || hero.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : hero.topImg ? (
                      <img
                        src={hero.topImg}
                        alt={hero.nameLoc || hero.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl font-bold text-primary/20">
                          {(hero.nameLoc || hero.name).charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {hero.nameLoc || hero.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {hero.nameEnglishLoc && hero.nameLoc !== hero.nameEnglishLoc && (
                        <div>
                          <span className="text-xs text-muted-foreground">英文名: </span>
                          <span className="text-sm">{hero.nameEnglishLoc}</span>
                        </div>
                      )}

                      {hero.primaryAttr !== undefined && (
                        <div>
                          <span className="text-xs text-muted-foreground">主属性: </span>
                          <span className="text-sm">
                            {hero.primaryAttr === 0 ? '力量' : hero.primaryAttr === 1 ? '敏捷' : hero.primaryAttr === 2 ? '智力' : hero.primaryAttr === 3 ? '全才' : '未知'}
                          </span>
                        </div>
                      )}

                      {hero.bioLoc && (
                        <p className="text-xs text-muted-foreground line-clamp-3">{hero.bioLoc}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">暂无英雄数据</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
