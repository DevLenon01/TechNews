import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Eye, Bookmark, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditProfileDialog } from "@/components/EditProfileDialog";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const profileQuery = trpc.profile.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const activityQuery = trpc.profile.getActivityHistory.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

  const favoritesQuery = trpc.profile.getFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleProfileUpdated = () => {
    setRefreshKey(prev => prev + 1);
    profileQuery.refetch();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar seu perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = profileQuery.data?.stats || { comments: 0, likes: 0, views: 0 };
  const activities = activityQuery.data || [];
  const favorites = favoritesQuery.data || [];

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      view: "Visualizou",
      comment: "Comentou",
      like: "Curtiu",
    };
    return labels[type] || type;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "comment":
        return <MessageSquare className="w-4 h-4" />;
      case "like":
        return <Heart className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6 flex-1">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl mb-2">{user?.name || "Usuário"}</CardTitle>
                  <CardDescription className="text-base">{user?.email}</CardDescription>
                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <span>Membro desde {format(new Date(user?.createdAt || new Date()), "MMM yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
              <div>
                {user && (
                  <EditProfileDialog key={refreshKey} user={user} onProfileUpdated={handleProfileUpdated} />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.views}</div>
              <p className="text-xs text-muted-foreground mt-1">Artigos visualizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Curtidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.likes}</div>
              <p className="text-xs text-muted-foreground mt-1">Artigos curtidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-500" />
                Comentários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.comments}</div>
              <p className="text-xs text-muted-foreground mt-1">Comentários feitos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">Histórico de Atividades</TabsTrigger>
            <TabsTrigger value="favorites">Notícias Favoritas</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            {activityQuery.isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {getActivityIcon(activity.activityType)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {getActivityLabel(activity.activityType)} artigo #{activity.articleId}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(activity.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade registrada ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favoritesQuery.isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bookmark className="w-5 h-5 text-purple-500 fill-purple-500" />
                          <div>
                            <p className="font-medium">Artigo #{favorite.articleId}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(favorite.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não tem notícias favoritas</p>
                  <p className="text-sm mt-2">Clique no ícone de coração para adicionar notícias aos favoritos</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
