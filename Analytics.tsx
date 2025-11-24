import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Eye, MessageSquare, Heart } from "lucide-react";

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

export function Analytics({ articles }: { articles: Article[] }) {
  // Mock analytics data
  const analyticsData = articles.map((article, index) => ({
    name: article.title.substring(0, 20) + "...",
    views: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 50) + 5,
    likes: Math.floor(Math.random() * 100) + 10,
  }));

  const topArticles = [...analyticsData].sort((a, b) => b.views - a.views).slice(0, 5);

  const categoryData = [
    { name: "IA", value: 35 },
    { name: "Quantum", value: 20 },
    { name: "Energia", value: 25 },
    { name: "Outros", value: 20 },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  const totalStats = {
    totalViews: analyticsData.reduce((sum, item) => sum + item.views, 0),
    totalComments: analyticsData.reduce((sum, item) => sum + item.comments, 0),
    totalLikes: analyticsData.reduce((sum, item) => sum + item.likes, 0),
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Análises e Estatísticas</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total de Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalStats.totalViews.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% em relação à semana anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Total de Comentários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {totalStats.totalComments.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +8% em relação à semana anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Total de Curtidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {totalStats.totalLikes.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +15% em relação à semana anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Artigos Mais Lidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topArticles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#3b82f6" name="Visualizações" />
                <Bar dataKey="likes" fill="#ec4899" name="Curtidas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detalhes de Engajamento por Artigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 font-semibold">Artigo</th>
                  <th className="text-center py-2 px-4 font-semibold">Visualizações</th>
                  <th className="text-center py-2 px-4 font-semibold">Comentários</th>
                  <th className="text-center py-2 px-4 font-semibold">Curtidas</th>
                  <th className="text-center py-2 px-4 font-semibold">Engajamento</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((item, index) => {
                  const engagement = (
                    ((item.comments + item.likes) / item.views) *
                    100
                  ).toFixed(1);
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="text-center py-3 px-4 text-blue-600 font-semibold">
                        {item.views}
                      </td>
                      <td className="text-center py-3 px-4 text-purple-600 font-semibold">
                        {item.comments}
                      </td>
                      <td className="text-center py-3 px-4 text-red-600 font-semibold">
                        {item.likes}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-semibold">
                          {engagement}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
