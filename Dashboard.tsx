import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { NewsCard } from "@/components/NewsCard";
import { CommentsSection } from "@/components/CommentsSection";
import { ChatBot } from "@/components/ChatBot";
import { Analytics } from "@/components/Analytics";
import { RefreshCw, MessageSquare, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

// Mock news data
const MOCK_NEWS = [
  {
    id: 1,
    title: "Inteligência Artificial revoluciona o mercado de trabalho em 2024",
    description: "Novas ferramentas de IA estão transformando diversos setores, criando oportunidades e desafios para profissionais de tecnologia.",
    url: "https://example.com/news/1",
    urlToImage: "https://picsum.photos/400/250?random=1",
    author: "João Silva",
    source: "TechBrasil",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: "Meta lança novo headset de realidade virtual com tecnologia avançada",
    description: "O novo dispositivo promete experiências mais imersivas com melhor resolução e menor latência para jogos e aplicações profissionais.",
    url: "https://example.com/news/2",
    urlToImage: "https://picsum.photos/400/250?random=2",
    author: "Maria Santos",
    source: "Inovação Digital",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: "Startup brasileira desenvolve solução inovadora para energia solar",
    description: "Empresa nacional cria tecnologia que aumenta eficiência de painéis solares em 30%, revolucionando o setor de energia renovável.",
    url: "https://example.com/news/3",
    urlToImage: "https://picsum.photos/400/250?random=3",
    author: "Carlos Oliveira",
    source: "Energia Tech",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: "Apple anuncia novos recursos de privacidade para iOS 18",
    description: "Atualização traz melhorias significativas na proteção de dados pessoais e controle de privacidade para usuários.",
    url: "https://example.com/news/4",
    urlToImage: "https://picsum.photos/400/250?random=4",
    author: "Ana Costa",
    source: "Mobile News",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: 5,
    title: "Quantum computing: IBM apresenta processador quântico de 1000 qubits",
    description: "Novo processador marca um marco importante no desenvolvimento da computação quântica comercial.",
    url: "https://example.com/news/5",
    urlToImage: "https://picsum.photos/400/250?random=5",
    author: "Pedro Almeida",
    source: "Quantum Tech",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
  },
  {
    id: 6,
    title: "Tesla revela nova tecnologia de bateria com autonomia de 1000km",
    description: "Inovação promete revolucionar o mercado de veículos elétricos com maior autonomia e carregamento mais rápido.",
    url: "https://example.com/news/6",
    urlToImage: "https://picsum.photos/400/250?random=6",
    author: "Lucia Ferreira",
    source: "Auto Tech",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<typeof MOCK_NEWS[0] | null>(null);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Últimas Notícias de Tecnologia
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fique por dentro das principais novidades do mundo da tecnologia
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={() => setShowChatBot(!showChatBot)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chatbot de IA
            </Button>
            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Análises
            </Button>
          </div>

          {/* ChatBot Section */}
          {showChatBot && (
            <div className="mb-8">
              <ChatBot />
            </div>
          )}

          {/* Analytics Section */}
          {showAnalytics && (
            <div className="mb-8">
              <Analytics articles={MOCK_NEWS} />
            </div>
          )}

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {MOCK_NEWS.map((article) => (
              <div key={article.id} onClick={() => setSelectedArticle(article)}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>

          {/* Comments Section */}
          {selectedArticle && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {selectedArticle.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Por {selectedArticle.author}</span>
                    <span>•</span>
                    <span>{selectedArticle.source}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CommentsSection articleId={selectedArticle.id} />
                  <Button
                    onClick={() => setSelectedArticle(null)}
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
