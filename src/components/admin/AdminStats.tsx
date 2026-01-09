import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  onlineUsers: number;
  totalProducts: number;
  productChange: number;
  pendingOrders: number;
  pendingOrdersValue: number;
  todaySales: number;
  yesterdaySales: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    onlineUsers: 0,
    totalProducts: 0,
    productChange: 0,
    pendingOrders: 0,
    pendingOrdersValue: 0,
    todaySales: 0,
    yesterdaySales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Set up realtime subscriptions
    const ordersChannel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(yesterday);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

      // Fetch all stats in parallel
      const [
        usersResult,
        productsResult,
        yesterdayProductsResult,
        pendingOrdersResult,
        todaySalesResult,
        yesterdaySalesResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id, last_seen", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }).lt("created_at", today.toISOString()),
        supabase.from("orders").select("id, total").eq("status", "pending"),
        supabase.from("orders").select("total").gte("created_at", today.toISOString()),
        supabase.from("orders").select("total").gte("created_at", yesterday.toISOString()).lt("created_at", today.toISOString()),
      ]);

      // Calculate online users (active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const onlineUsers = (usersResult.data || []).filter(
        (u) => u.last_seen && new Date(u.last_seen) > fiveMinutesAgo
      ).length;

      // Calculate product change
      const currentProducts = productsResult.count || 0;
      const yesterdayProducts = yesterdayProductsResult.count || 0;
      const productChange = currentProducts - yesterdayProducts;

      // Calculate pending orders value
      const pendingOrdersValue = (pendingOrdersResult.data || []).reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );

      // Calculate sales
      const todaySales = (todaySalesResult.data || []).reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const yesterdaySales = (yesterdaySalesResult.data || []).reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );

      setStats({
        totalUsers: usersResult.count || 0,
        onlineUsers,
        totalProducts: currentProducts,
        productChange,
        pendingOrders: pendingOrdersResult.data?.length || 0,
        pendingOrdersValue,
        todaySales,
        yesterdaySales,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const salesChange = stats.yesterdaySales > 0 
    ? ((stats.todaySales - stats.yesterdaySales) / stats.yesterdaySales * 100).toFixed(1)
    : stats.todaySales > 0 ? "100" : "0";

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      subtitle: `${stats.onlineUsers} online now`,
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      subtitle: stats.productChange >= 0 
        ? `+${stats.productChange} from yesterday` 
        : `${stats.productChange} from yesterday`,
      icon: stats.productChange >= 0 ? TrendingUp : TrendingDown,
      iconColor: stats.productChange >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      subtitle: `KES ${stats.pendingOrdersValue.toLocaleString()} value`,
      icon: Clock,
      iconColor: "text-yellow-500",
    },
    {
      title: "Today's Sales",
      value: `KES ${stats.todaySales.toLocaleString()}`,
      subtitle: `${Number(salesChange) >= 0 ? "+" : ""}${salesChange}% vs yesterday`,
      icon: DollarSign,
      iconColor: Number(salesChange) >= 0 ? "text-green-500" : "text-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-3 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
