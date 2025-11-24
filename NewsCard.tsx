import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, User, Heart } from "lucide-react";
import { useState } from "react";

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  author: string;
  source: string;
  publishedAt: Date;
}

export function NewsCard({ article }: { article: Article }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105 transform">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={article.urlToImage || `https://picsum.photos/400/250?random=${article.id}`}
          alt={article.title}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/400/250?random=${article.id}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <CardHeader className="flex-grow">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Tecnologia
          </Badge>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(article.publishedAt)}
          </div>
        </div>

        <CardTitle className="text-lg font-bold line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {article.title}
        </CardTitle>

        <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 flex-grow">
          {article.description}
        </CardDescription>

        {article.author && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <User className="w-4 h-4 mr-1" />
            <span className="truncate">{article.author}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={liked ? "default" : "outline"}
            onClick={handleLike}
            className={liked ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </Button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {article.source}
          </span>
        </div>
        <Button
          asChild
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200"
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ler mais
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
