"use client"

import { useState } from "react"
import { MessageCircle, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  // Sample agents data - in a real app, this would come from a data source
  const agents = [
    { id: 1, name: "Athena", type: "Research", avatar: "/placeholder.svg?height=40&width=40", modules: 5 },
    { id: 2, name: "Hermes", type: "Communication", avatar: "/placeholder.svg?height=40&width=40", modules: 3 },
    { id: 3, name: "Apollo", type: "Creative", avatar: "/placeholder.svg?height=40&width=40", modules: 4 },
    { id: 4, name: "Artemis", type: "Data Analysis", avatar: "/placeholder.svg?height=40&width=40", modules: 6 },
    { id: 5, name: "Hephaestus", type: "Builder", avatar: "/placeholder.svg?height=40&width=40", modules: 2 },
  ]

  const handleAgentSelect = (agentId: number) => {
    setIsDialogOpen(false)
    // Navigate to the chat page with the selected agent
    router.push(`/chat/${agentId}`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Chat"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              onClick={() => setIsDialogOpen(true)}
            >
              <MessageCircle />
              <span>Quick Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      {/* Agent Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select an Agent to Chat With</DialogTitle>
            <DialogDescription>Choose one of your AI agents to start a conversation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                variant="outline"
                className="flex items-center justify-start gap-3 h-16 px-4"
                onClick={() => handleAgentSelect(agent.id)}
              >
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={agent.avatar || "/placeholder.svg"}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {agent.type} • {agent.modules} modules
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  )
}

