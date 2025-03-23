"use client"

import type * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Update the data object with Mosaic-themed menu items
const data = {
  user: {
    name: "user",
    email: "user@example.com",
    avatar: "/avatars/s.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      title: "My Agents",
      url: "#",
      icon: UsersIcon,
    },
    {
      title: "Marketplace",
      url: "#",
      icon: BarChartIcon,
    },
    {
      title: "Skills Library",
      url: "#",
      icon: FolderIcon,
    },
    {
      title: "Community",
      url: "#",
      icon: ListIcon,
    },
  ],
  navClouds: [
    {
      title: "Agent Creation",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "New Agent",
          url: "#",
        },
        {
          title: "Templates",
          url: "#",
        },
      ],
    },
    {
      title: "Skill Development",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Create Skill",
          url: "#",
        },
        {
          title: "My Skills",
          url: "#",
        },
      ],
    },
    {
      title: "Modules",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Browse Modules",
          url: "#",
        },
        {
          title: "My Modules",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Wallet",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Transactions",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Agent Chat",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Mosaic</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

