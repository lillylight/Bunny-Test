"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  DollarSign, 
  TrendingUp, 
  Radio, 
  Clock,
  Trash2,
  Eye,
  Calendar
} from "lucide-react"
import { advertisingService, type Advertisement } from "@/lib/advertising-service"
import { useToast } from "@/hooks/use-toast"

export function AdvertisingDashboard() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [stats, setStats] = useState({
    totalAds: 0,
    scheduledAds: 0,
    completedAds: 0,
    revenue: 0,
    adsByShow: {} as { [key: string]: number },
    adsByType: {} as { [key: string]: number }
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get data from advertising service
      const allAds = advertisingService.getAllAdvertisements()
      const adStats = advertisingService.getAdvertisingStats()
      
      setAdvertisements(allAds)
      setStats(adStats)
    } catch (error) {
      console.error("Error loading advertising data:", error)
      toast({
        title: "Error",
        description: "Failed to load advertising data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteAdvertisement = (id: string) => {
    advertisingService.deleteAdvertisement(id)
    loadData()
    toast({
      title: "Advertisement Deleted",
      description: "The advertisement has been removed successfully.",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Prepare chart data
  const showChartData = Object.entries(stats.adsByShow).map(([show, count]) => ({
    name: show.split(' ')[0], // Shorten show names for chart
    value: count
  }))

  const typeChartData = Object.entries(stats.adsByType).map(([type, count]) => ({
    name: type === 'script' ? 'Text Script' : 'Audio File',
    value: count
  }))

  const COLORS = ['#ff5722', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#3f51b5']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5722] mx-auto mb-4"></div>
          <p className="text-[#666666]">Loading advertising data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#4caf50]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-[#666666]">From {stats.totalAds} advertisements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Radio className="h-4 w-4 text-[#ff5722]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledAds}</div>
            <p className="text-xs text-[#666666]">Currently scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#2196f3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAds}</div>
            <p className="text-xs text-[#666666]">Successfully aired</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Value</CardTitle>
            <DollarSign className="h-4 w-4 text-[#9c27b0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAds > 0 ? formatCurrency(stats.revenue / stats.totalAds) : '$0'}
            </div>
            <p className="text-xs text-[#666666]">Per advertisement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ads by Show</CardTitle>
            <CardDescription>Distribution of advertisements across shows</CardDescription>
          </CardHeader>
          <CardContent>
            {showChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={showChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff5722" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[#666666]">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ad Types</CardTitle>
            <CardDescription>Breakdown by advertisement type</CardDescription>
          </CardHeader>
          <CardContent>
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[#666666]">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advertisements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>Manage and view all advertisement campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <AdvertisementTable 
                advertisements={advertisements} 
                onDelete={deleteAdvertisement}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </TabsContent>
            
            <TabsContent value="scheduled">
              <AdvertisementTable 
                advertisements={advertisements.filter(ad => ad.status === 'scheduled')} 
                onDelete={deleteAdvertisement}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </TabsContent>
            
            <TabsContent value="completed">
              <AdvertisementTable 
                advertisements={advertisements.filter(ad => ad.status === 'completed')} 
                onDelete={deleteAdvertisement}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface AdvertisementTableProps {
  advertisements: Advertisement[]
  onDelete: (id: string) => void
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
}

function AdvertisementTable({ 
  advertisements, 
  onDelete, 
  formatCurrency, 
  formatDate 
}: AdvertisementTableProps) {
  if (advertisements.length === 0) {
    return (
      <div className="text-center py-8 text-[#666666]">
        No advertisements found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Show</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Package</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {advertisements.map((ad) => (
          <TableRow key={ad.id}>
            <TableCell className="font-medium">{ad.companyName}</TableCell>
            <TableCell>{ad.selectedShow}</TableCell>
            <TableCell>
              <Badge variant={ad.adType === 'script' ? 'default' : 'secondary'}>
                {ad.adType === 'script' ? 'Script' : 'Audio'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {ad.duration}s
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={ad.packageType === 'branded' ? 'default' : 'outline'}>
                {ad.packageType === 'branded' ? 'Branded' : 'Standard'}
              </Badge>
            </TableCell>
            <TableCell>{formatCurrency(ad.amount)}</TableCell>
            <TableCell>
              <Badge 
                variant={
                  ad.status === 'scheduled' ? 'default' : 
                  ad.status === 'playing' ? 'secondary' : 
                  'outline'
                }
              >
                {ad.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(ad.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {ad.adScript && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Show script in a modal or alert
                      alert(`Advertisement Script:\n\n${ad.adScript}`)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(ad.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
