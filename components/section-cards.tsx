import { TrendingUpIcon, Wallet, Brain, Zap, MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-1">
            <Brain className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">My Agents</span>
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">7</CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs whitespace-nowrap">
              <TrendingUpIcon className="size-3 flex-shrink-0" />
              +2 new
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">5 active, 2 in training</div>
          <div className="text-muted-foreground truncate">Last agent acquired 2 days ago</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-1">
            <Zap className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Total Skills</span>
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">23</CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs whitespace-nowrap">
              <TrendingUpIcon className="size-3 flex-shrink-0" />
              +4 new
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">18 deployed across agents</div>
          <div className="text-muted-foreground truncate">5 skills available to assign</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-1">
            <Wallet className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Agent Wallets</span>
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">0.87 ETH</CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs whitespace-nowrap">
              <TrendingUpIcon className="size-3 flex-shrink-0" />
              +0.12 ETH
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Combined agent balance</div>
          <div className="text-muted-foreground truncate">~$1,740 at current rates</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Interactions</span>
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">1,248</CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs whitespace-nowrap">
              <TrendingUpIcon className="size-3 flex-shrink-0" />
              +32%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Last 30 days</div>
          <div className="text-muted-foreground truncate">287 tasks completed</div>
        </CardFooter>
      </Card>
    </div>
  )
}

