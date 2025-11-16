import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, startOfDay, endOfDay, subDays, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
}

interface OrderItem {
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--chart-1))",
  paid: "hsl(var(--chart-2))",
  processing: "hsl(var(--chart-3))",
  shipped: "hsl(var(--chart-4))",
  delivered: "hsl(var(--chart-5))",
  cancelled: "hsl(var(--destructive))",
};

type DateRangePreset = "today" | "last7days" | "last30days" | "custom";

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("last30days");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRangePreset, customDateFrom, customDateTo]);

  const getDateRange = (): { startDate: Date; endDate: Date } => {
    const now = new Date();
    const endDate = endOfDay(now);
    let startDate: Date;

    switch (dateRangePreset) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "last7days":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "last30days":
        startDate = startOfDay(subDays(now, 30));
        break;
      case "custom":
        startDate = customDateFrom ? startOfDay(customDateFrom) : startOfDay(subDays(now, 30));
        return {
          startDate,
          endDate: customDateTo ? endOfDay(customDateTo) : endDate,
        };
      default:
        startDate = startOfDay(subDays(now, 30));
    }

    return { startDate, endDate };
  };

  const fetchAnalyticsData = async () => {
    try {
      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: true });

      if (ordersError) throw ordersError;

      // Fetch all order items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*");

      if (itemsError) throw itemsError;

      if (orders && orderItems) {
        processAnalytics(orders, orderItems);
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (orders: Order[], orderItems: OrderItem[]) => {
    const { startDate, endDate } = getDateRange();

    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return isWithinInterval(orderDate, { start: startDate, end: endDate });
    });

    // Calculate total revenue and orders
    const revenue = filteredOrders.reduce((sum, order) => sum + Number(order.total), 0);
    setTotalRevenue(revenue);
    setTotalOrders(filteredOrders.length);

    // Process revenue by date
    const revenueByDate: Record<string, number> = {};

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const dateKey = orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + Number(order.total);
    });

    const revenueChartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));
    setRevenueData(revenueChartData);

    // Process orders by status
    const statusCount: Record<string, number> = {};
    filteredOrders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    const statusChartData = Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
    setStatusData(statusChartData);

    // Process top-selling products (filter items by filtered orders)
    const filteredOrderIds = new Set(filteredOrders.map(o => o.id));
    const filteredItems = orderItems.filter(item => filteredOrderIds.has(item.order_id));

    const productStats: Record<string, { quantity: number; revenue: number }> = {};
    filteredItems.forEach(item => {
      if (!productStats[item.product_name]) {
        productStats[item.product_name] = { quantity: 0, revenue: 0 };
      }
      productStats[item.product_name].quantity += item.quantity;
      productStats[item.product_name].revenue += Number(item.price) * item.quantity;
    });

    const productChartData = Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    setProductData(productChartData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset !== "custom") {
      setCustomDateFrom(undefined);
      setCustomDateTo(undefined);
    }
  };

  const getDateRangeLabel = () => {
    if (dateRangePreset === "custom" && customDateFrom && customDateTo) {
      return `${format(customDateFrom, "MMM dd, yyyy")} - ${format(customDateTo, "MMM dd, yyyy")}`;
    }
    if (dateRangePreset === "custom" && customDateFrom) {
      return `From ${format(customDateFrom, "MMM dd, yyyy")}`;
    }
    const labels: Record<DateRangePreset, string> = {
      today: "Today",
      last7days: "Last 7 Days",
      last30days: "Last 30 Days",
      custom: "Custom Range",
    };
    return labels[dateRangePreset];
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Filter analytics by time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={dateRangePreset === "today" ? "default" : "outline"}
              onClick={() => handlePresetChange("today")}
              size="sm"
            >
              Today
            </Button>
            <Button
              variant={dateRangePreset === "last7days" ? "default" : "outline"}
              onClick={() => handlePresetChange("last7days")}
              size="sm"
            >
              Last 7 Days
            </Button>
            <Button
              variant={dateRangePreset === "last30days" ? "default" : "outline"}
              onClick={() => handlePresetChange("last30days")}
              size="sm"
            >
              Last 30 Days
            </Button>
            <Button
              variant={dateRangePreset === "custom" ? "default" : "outline"}
              onClick={() => handlePresetChange("custom")}
              size="sm"
            >
              Custom Range
            </Button>
          </div>

          {dateRangePreset === "custom" && (
            <div className="flex flex-wrap gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !customDateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateFrom ? format(customDateFrom, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateFrom}
                    onSelect={setCustomDateFrom}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !customDateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateTo ? format(customDateTo, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateTo}
                    onSelect={setCustomDateTo}
                    initialFocus
                    disabled={(date) => customDateFrom ? date < customDateFrom : false}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing data for: <span className="font-medium text-foreground">{getDateRangeLabel()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{getDateRangeLabel()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">{getDateRangeLabel()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productData.length}</div>
            <p className="text-xs text-muted-foreground">Best sellers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>{getDateRangeLabel()} revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Orders",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status.toLowerCase()] || "hsl(var(--chart-1))"}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-2))",
                },
                quantity: {
                  label: "Quantity",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue (KES)" />
                  <Bar dataKey="quantity" fill="hsl(var(--chart-3))" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
