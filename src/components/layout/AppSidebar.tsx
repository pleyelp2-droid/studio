"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  ScrollText, 
  UserPlus, 
  ShoppingBag, 
  Database, 
  Settings,
  Activity,
  Zap,
  Home,
  MonitorPlay,
  BrainCircuit,
  BookOpen,
  Atom,
  HardDriveDownload,
  Wifi,
  FileJson,
  LogIn,
  LogOut,
  User as UserIcon,
  ClipboardList
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useUser, useAuth } from "@/firebase"
import { AuthModal } from "@/components/auth/AuthModal"
import { signOut } from "firebase/auth"

const mainItems = [
  { title: "Oversight", icon: LayoutDashboard, url: "/dashboard" },
  { title: "World Preview", icon: MonitorPlay, url: "/world-preview" },
  { title: "Players", icon: Users, url: "/players" },
  { title: "Agent Oversight", icon: ShieldAlert, url: "/agents" },
  { title: "Audit Logs", icon: ClipboardList, url: "/admin/audit-logs" },
]

const godotItems = [
  { title: "Bridge Protocol", icon: HardDriveDownload, url: "/godot" },
  { title: "Project Sync", icon: Wifi, url: "/godot#sync" },
  { title: "Export Data", icon: FileJson, url: "/godot#export" },
]

const contentItems = [
  { title: "Content Brain", icon: BrainCircuit, url: "/admin/content" },
  { title: "Quest Engine", icon: ScrollText, url: "/quests" },
  { title: "NPC Architect", icon: UserPlus, url: "/npcs" },
  { title: "Lore Archives", icon: BookOpen, url: "/admin/lore" },
  { title: "Molecule Explorer", icon: Atom, url: "/dashboard/molecules" },
  { title: "Asset Hub", icon: Database, url: "/assets" },
]

const commerceItems = [
  { title: "Axiom Store", icon: ShoppingBag, url: "/store" },
  { title: "Economy Stats", icon: Activity, url: "/economy" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  const handleLogout = () => {
    signOut(auth)
  }

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg axiom-gradient">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-lg font-headline font-bold leading-none">AXIOM</span>
              <span className="text-xs text-muted-foreground">FRONTIER</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">User</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {user ? (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/profile'} tooltip="Profile">
                        <Link href="/profile">
                          <UserIcon />
                          <span>{user.displayName || user.email?.split('@')[0] || 'Pilot'}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
                        <LogOut />
                        <span>Sign Out</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setAuthModalOpen(true)} tooltip="Sign In">
                      <LogIn />
                      <span>Sign In</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Control Center</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Godot Bridge</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {godotItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Dynamic Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">E-Commerce</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {commerceItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Public Access</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Landing Page">
                    <Link href="/">
                      <Home />
                      <span>Public Landing</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/settings'}>
                <Link href="/settings">
                  <Settings />
                  <span>Global Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
