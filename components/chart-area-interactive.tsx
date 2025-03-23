"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Updated chart data to reflect user's agent metrics
const chartData = [
  { date: "2024-04-01", tasks: 22, earnings: 0.05, interactions: 45 },
  { date: "2024-04-02", tasks: 25, earnings: 0.06, interactions: 47 },
  { date: "2024-04-03", tasks: 20, earnings: 0.04, interactions: 49 },
  { date: "2024-04-04", tasks: 28, earnings: 0.07, interactions: 52 },
  { date: "2024-04-05", tasks: 30, earnings: 0.08, interactions: 56 },
  { date: "2024-04-06", tasks: 26, earnings: 0.06, interactions: 61 },
  { date: "2024-04-07", tasks: 24, earnings: 0.05, interactions: 65 },
  { date: "2024-04-08", tasks: 29, earnings: 0.07, interactions: 70 },
  { date: "2024-04-09", tasks: 31, earnings: 0.08, interactions: 75 },
  { date: "2024-04-10", tasks: 33, earnings: 0.09, interactions: 82 },
  { date: "2024-04-11", tasks: 35, earnings: 0.1, interactions: 89 },
  { date: "2024-04-12", tasks: 37, earnings: 0.11, interactions: 95 },
  { date: "2024-04-13", tasks: 39, earnings: 0.12, interactions: 102 },
  { date: "2024-04-14", tasks: 41, earnings: 0.13, interactions: 110 },
  { date: "2024-04-15", tasks: 43, earnings: 0.14, interactions: 118 },
  { date: "2024-04-16", tasks: 45, earnings: 0.15, interactions: 125 },
  { date: "2024-04-17", tasks: 47, earnings: 0.16, interactions: 132 },
  { date: "2024-04-18", tasks: 49, earnings: 0.17, interactions: 140 },
  { date: "2024-04-19", tasks: 51, earnings: 0.18, interactions: 148 },
  { date: "2024-04-20", tasks: 53, earnings: 0.19, interactions: 156 },
  { date: "2024-04-21", tasks: 55, earnings: 0.2, interactions: 164 },
  { date: "2024-04-22", tasks: 57, earnings: 0.21, interactions: 172 },
  { date: "2024-04-23", tasks: 59, earnings: 0.22, interactions: 180 },
  { date: "2024-04-24", tasks: 61, earnings: 0.23, interactions: 188 },
  { date: "2024-04-25", tasks: 63, earnings: 0.24, interactions: 196 },
  { date: "2024-04-26", tasks: 65, earnings: 0.25, interactions: 204 },
  { date: "2024-04-27", tasks: 67, earnings: 0.26, interactions: 212 },
  { date: "2024-04-28", tasks: 69, earnings: 0.27, interactions: 220 },
  { date: "2024-04-29", tasks: 71, earnings: 0.28, interactions: 228 },
  { date: "2024-04-30", tasks: 73, earnings: 0.29, interactions: 236 },
]

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
    color: "hsl(var(--chart-1))",
  },
  earnings: {
    label: "Earnings (ETH)",
    color: "hsl(var(--chart-2))",
  },
  interactions: {
    label: "Interactions",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [dataType, setDataType] = React.useState("tasks")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-04-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Agent Performance</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Track your agents' tasks, earnings, and interactions</span>
          <span className="@[540px]/card:hidden">Agent metrics</span>
        </CardDescription>
        <div className="absolute right-4 top-4 flex flex-col gap-2 sm:flex-row">
          <Select value={dataType} onValueChange={setDataType} className="w-32">
            <SelectTrigger aria-label="Select data type">
              <SelectValue placeholder="Tasks" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="tasks" className="rounded-lg">
                Tasks
              </SelectItem>
              <SelectItem value="earnings" className="rounded-lg">
                Earnings
              </SelectItem>
              <SelectItem value="interactions" className="rounded-lg">
                Interactions
              </SelectItem>
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange} className="@[767px]/card:hidden">
            <SelectTrigger className="w-40" aria-label="Select time range">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-tasks)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-tasks)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-earnings)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-earnings)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-interactions)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-interactions)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {dataType === "tasks" && (
              <Area
                dataKey="tasks"
                type="monotone"
                fill="url(#fillTasks)"
                stroke="var(--color-tasks)"
                strokeWidth={2}
              />
            )}
            {dataType === "earnings" && (
              <Area
                dataKey="earnings"
                type="monotone"
                fill="url(#fillEarnings)"
                stroke="var(--color-earnings)"
                strokeWidth={2}
              />
            )}
            {dataType === "interactions" && (
              <Area
                dataKey="interactions"
                type="monotone"
                fill="url(#fillInteractions)"
                stroke="var(--color-interactions)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

