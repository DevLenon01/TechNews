import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Trash2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  avatar?: string;
}

export function CommentsSection({ articleId }: { articleId: number }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "João Silva",
      content: "Excelente artigo! Muito informativo.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: "https://ui-avatars.com/api/?name=João+Silva&background=6366f1&color=fff",
    },
    {
      id: 2,
      author: "Maria Santos",
      content: "Concordo totalmente com os pontos levantados.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      avatar: "https://ui-avatars.com/api/?name=Maria+Santos&background=ec4899&color=fff",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      const userImage = user?.image ? String(user.image) : undefined;
      const userName = user?.name ? String(user.name) : "Anônimo";
      
      const comment: Comment = {
        id: comments.length + 1,
        author: userName,
        content: newComment,
        timestamp: new Date(),
        avatar: userImage,
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleDeleteComment = (id: number) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Comentários ({comments.length})</h3>

        {/* New Comment Form */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image ? String(user.image) : undefined} alt={user?.name ? String(user.name) : "User"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment();
                    }
                  }}
                  className="mb-2"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewComment("")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={comment.avatar} alt={comment.author} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {comment.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{comment.author}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(comment.timestamp)}
                          </p>
                        </div>
                        {user?.id === comment.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
