"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/user-profile";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { Clock, Phone, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface CallHistorySidebarProps {
  activeCallId: Id<"calls"> | null;
  onCallSelect: (callId: Id<"calls">) => void;
}

export function CallHistorySidebar({
  activeCallId,
  onCallSelect,
}: CallHistorySidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [callToDelete, setCallToDelete] = useState<Id<"calls"> | null>(null);
  const calls = useQuery(api.calls.list);
  const deleteCall = useMutation(api.calls.remove);
  const { toast } = useToast();

  const filteredCalls =
    calls?.filter((call: Doc<"calls">) =>
      call.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "recording":
        return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      case "processing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleDeleteConfirm = async () => {
    if (!callToDelete) return;

    if (activeCallId === callToDelete) {
      router.push("/");
    }

    try {
      await deleteCall({ id: callToDelete });
      toast({
        title: "Call deleted",
        description: "The call has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the call.",
        variant: "destructive",
      });
    } finally {
      setCallToDelete(null);
    }
  };

  const handleDeleteClick = (callId: Id<"calls">, e: React.MouseEvent) => {
    e.stopPropagation();
    setCallToDelete(callId);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = format(date, "MMM d, yyyy");
    const timeStr = format(date, "h:mm a");
    return { dateStr, timeStr };
  };

  const getCallToDeleteTitle = () => {
    const call = calls?.find((call) => call._id === callToDelete);
    return call?.title || "this call";
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              Heardly
            </h1>
            <p className="text-sm text-sidebar-foreground/70">
              Call Recording & Analysis
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span>Call History</span>
          </SidebarGroupLabel>

          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredCalls.map((call: Doc<"calls">) => {
                const { dateStr, timeStr } = formatDateTime(call._creationTime);

                return (
                  <SidebarMenuItem key={call._id}>
                    <SidebarMenuButton
                      onClick={() => onCallSelect(call._id)}
                      isActive={activeCallId === call._id}
                      className="w-full p-3 h-auto"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-sm truncate">
                            {call.title}
                          </span>
                          <Badge
                            className={`text-xs whitespace-nowrap flex-shrink-0 ${getStatusColor(
                              call.status
                            )}`}
                          >
                            {call.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {dateStr} at {timeStr}
                          </span>
                        </div>
                        {call.duration && call.duration > 0 && (
                          <div className="text-xs text-muted-foreground/70 truncate">
                            Duration: {formatDuration(call.duration)}
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                    <AlertDialog
                      open={callToDelete === call._id}
                      onOpenChange={(open) => !open && setCallToDelete(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <SidebarMenuAction
                          onClick={(e) => handleDeleteClick(call._id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </SidebarMenuAction>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Call</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "
                            {getCallToDeleteTitle()}"? This action cannot be
                            undone and will permanently remove the call
                            recording, transcript, and any associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Call
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
