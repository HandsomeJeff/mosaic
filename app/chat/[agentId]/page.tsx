"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, MessageCircle, PaperclipIcon, Plus, Send, Settings, Trash, Zap } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Sample data for the chat interface
const agents = [
  { id: 1, name: "Athena", type: "Research", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Hermes", type: "Communication", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Apollo", type: "Creative", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Artemis", type: "Data Analysis", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Hephaestus", type: "Builder", avatar: "/placeholder.svg?height=40&width=40" },
]

const conversations = [
  {
    id: 1,
    agentId: 1,
    title: "Research on blockchain",
    lastMessage: "I've compiled the research...",
    timestamp: "2h ago",
  },
  { id: 2, agentId: 1, title: "NFT market analysis", lastMessage: "The market shows signs of...", timestamp: "1d ago" },
  {
    id: 3,
    agentId: 2,
    title: "Email drafts",
    lastMessage: "I've prepared the email templates...",
    timestamp: "3d ago",
  },
  {
    id: 4,
    agentId: 3,
    title: "Logo design ideas",
    lastMessage: "Here are some concepts I created...",
    timestamp: "5d ago",
  },
]

// Renamed from skills to modules with predefined color classes
const modules = [
  {
    id: 1,
    name: "Research",
    colorClass: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
    equipped: true,
  },
  {
    id: 2,
    name: "Analysis",
    colorClass: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
    equipped: true,
  },
  {
    id: 3,
    name: "Summary",
    colorClass: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
    equipped: true,
  },
  {
    id: 4,
    name: "Citation",
    colorClass: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
    equipped: true,
  },
  {
    id: 5,
    name: "Fact-check",
    colorClass: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
    equipped: true,
  },
  {
    id: 6,
    name: "Web Search",
    colorClass: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20",
    equipped: false,
  },
  {
    id: 7,
    name: "Data Visualization",
    colorClass: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20",
    equipped: false,
  },
  {
    id: 8,
    name: "Code Generation",
    colorClass: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20",
    equipped: false,
  },
  {
    id: 9,
    name: "Natural Language Processing",
    colorClass: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
    equipped: false,
  },
  {
    id: 10,
    name: "Image Recognition",
    colorClass: "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20",
    equipped: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "user",
    content: "Can you research the latest developments in NFT technology?",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "agent",
    content:
      "Of course! I'll gather information on the latest NFT developments. Are you interested in any specific aspect like new standards, marketplaces, or use cases?",
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    sender: "user",
    content: "I'm particularly interested in new standards and interoperability between different blockchains.",
    timestamp: "10:33 AM",
  },
  {
    id: 4,
    sender: "agent",
    content:
      "Great focus! I'll research the latest NFT standards and cross-chain interoperability. This includes developments like ERC-721A, ERC-1155, and newer proposals. I'll also look into bridge technologies and multi-chain NFT platforms. Would you like me to include information about specific blockchains like Ethereum, Solana, or others?",
    timestamp: "10:35 AM",
  },
]

export default function ChatPage() {
  const params = useParams()
  const agentId = Number.parseInt(params.agentId as string)
  const agent = agents.find((a) => a.id === agentId) || agents[0]

  const [inputValue, setInputValue] = useState("")
  const [activeModules, setActiveModules] = useState(modules.filter((m) => m.equipped))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", inputValue)
      setInputValue("")
    }
  }

  const toggleModule = (moduleId: number) => {
    setActiveModules((prev) => {
      const module = modules.find((m) => m.id === moduleId)
      if (!module) return prev

      const isCurrentlyActive = prev.some((m) => m.id === moduleId)
      if (isCurrentlyActive) {
        return prev.filter((m) => m.id !== moduleId)
      } else {
        return [...prev, module]
      }
    })
  }

  const agentConversations = conversations.filter((c) => c.agentId === agentId)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Conversations Sidebar - Slightly narrower */}
      <div className="w-72 border-r flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{agent.name}</h2>
              <p className="text-xs text-muted-foreground">{agent.type} Agent</p>
            </div>
          </div>

          <Button className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {agentConversations.length > 0 ? (
              agentConversations.map((conversation) => (
                <Button key={conversation.id} variant="ghost" className="w-full justify-start mb-1 p-3 h-auto">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{conversation.title}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{conversation.lastMessage}</span>
                    <span className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</span>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-xs">Start a new chat with {agent.name}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area - Slightly narrower */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{agent.name}</h2>
              <div className="flex gap-1">
                {activeModules.slice(0, 3).map((module) => (
                  <Badge key={module.id} variant="outline" className="text-xs px-1 whitespace-nowrap">
                    {module.name}
                  </Badge>
                ))}
                {activeModules.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1">
                    +{activeModules.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="icon">
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Agent Info Sidebar - Wider */}
      <div className="w-96 border-l h-full">
        <Tabs defaultValue="modules">
          <TabsList className="w-full">
            <TabsTrigger value="modules" className="flex-1">
              Modules
            </TabsTrigger>
            <TabsTrigger value="info" className="flex-1">
              Agent Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="p-4 h-[calc(100vh-48px)] overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Equipped Modules</CardTitle>
                  <CardDescription>
                    {activeModules.length} of {modules.length} modules equipped
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {modules.map((module) => {
                      const isEquipped = activeModules.some((m) => m.id === module.id)
                      return (
                        <Button
                          key={module.id}
                          variant={isEquipped ? "default" : "outline"}
                          className={cn("justify-start h-auto py-2 px-3", isEquipped ? module.colorClass : "")}
                          onClick={() => toggleModule(module.id)}
                        >
                          <Zap className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{module.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Modules
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Module Marketplace</CardTitle>
                  <CardDescription>Discover new modules for your agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Badge className="bg-emerald-500/10 text-emerald-500 mr-2">New</Badge>
                          <h3 className="font-medium">Blockchain Analytics</h3>
                        </div>
                        <Badge variant="outline">0.05 ETH</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Advanced blockchain data analysis with real-time market insights.
                      </p>
                      <Button size="sm" className="w-full">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Module
                      </Button>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Badge className="bg-blue-500/10 text-blue-500 mr-2">Popular</Badge>
                          <h3 className="font-medium">Smart Contract Audit</h3>
                        </div>
                        <Badge variant="outline">0.08 ETH</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Security analysis for smart contracts with vulnerability detection.
                      </p>
                      <Button size="sm" className="w-full">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Module
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Browse All Modules
                  </Button>
                </CardFooter>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="info" className="p-4 h-[calc(100vh-48px)] overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agent Details</CardTitle>
                  <CardDescription>Information about {agent.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.type} Agent</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasks Completed</p>
                        <p className="font-medium">247</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">98.2%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Wallet Balance</p>
                        <p className="font-medium">0.18 ETH</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Active</p>
                        <p className="font-medium">Now</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {agent.name} is specialized in {agent.type.toLowerCase()} tasks, equipped with advanced modules
                      for data processing and analysis. This agent can assist with research, summarization, and
                      fact-checking.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">NFT Details</h4>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <p className="text-muted-foreground">Token ID</p>
                          <p className="font-medium font-mono">#A7F391</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Collection</p>
                          <p className="font-medium">Mosaic Agents</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Blockchain</p>
                          <p className="font-medium">Polygon</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">14 days ago</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        View on Block Explorer
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    Transfer Ownership
                  </Button>
                </CardFooter>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

