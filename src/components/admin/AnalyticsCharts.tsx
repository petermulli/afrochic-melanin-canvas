import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

interface DailyStat {
  date: string;
  users: number;
  products: number;
  sales: number;
}

interface CategoryStat {
  category: string;
  count: number;
}

const COLORS = ["hsl(14, 52%, 46%)", "hsl(30, 33%, 65%)", "hsl(78, 22%, 51%)", "hsl(15, 29%, 18%)", "hsl(35, 70%, 97%)"];

const AnalyticsCharts = () => {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get last 7 days of data
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      // Fetch all data in parallel
      const [ordersResult, productsResult, usersResult] = await Promise.all([
        supabase.from("orders").select("created_at, total"),
        supabase.from("products").select("created_at, category"),
        supabase.from("profiles").select("created_at"),
      ]);

      // Process daily stats
      const stats = dates.map((date) => {
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayOrders = (ordersResult.data || []).filter((o) => {
          const created = new Date(o.created_at || "");
          return created >= dayStart && created < dayEnd;
        });

        const dayProducts = (productsResult.data || []).filter((p) => {
          const created = new Date(p.created_at || "");
          return created >= dayStart && created < dayEnd;
        });

        const dayUsers = (usersResult.data || []).filter((u) => {
          const created = new Date(u.created_at || "");
          return created >= dayStart && created < dayEnd;
        });

        return {
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          users: dayUsers.length,
          products: dayProducts.length,
          sales: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        };
      });

      setDailyStats(stats);

      // Process category stats
      const categories: Record<string, number> = {};
      (productsResult.data || []).forEach((p) => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });

      setCategoryStats(
        Object.entries(categories)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const chartConfig = {
    sales: { label: "Sales", color: "hsl(14, 52%, 46%)" },
    users: { label: "Users", color: "hsl(78, 22%, 51%)" },
    products: { label: "Products", color: "hsl(30, 33%, 65%)" },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          <CardDescription>Daily sales revenue in KES</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(14, 52%, 46%)"
                strokeWidth={2}
                dot={{ fill: "hsl(14, 52%, 46%)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User & Product Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>New Registrations (Last 7 Days)</CardTitle>
          <CardDescription>New users and product listings</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="hsl(78, 22%, 51%)" />
              <Bar dataKey="products" fill="hsl(30, 33%, 65%)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Product Categories */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Products by Category</CardTitle>
          <CardDescription>Distribution of products across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-[250px] w-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, percent }) =>
                      `${category} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4">
              {categoryStats.map((stat, index) => (
                <div key={stat.category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">
                    {stat.category}: {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
