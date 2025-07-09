"use client";

import { AuthSignIn } from "@/components/auth-signin";
import { CallHistorySidebar } from "@/components/call-history-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Calendar, Clock, FileText, Phone, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [activeCallId, setActiveCallId] = useState<Id<"calls"> | null>(null);
  const router = useRouter();

  // Check authentication status first
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();

  // Only run the query if authenticated
  const calls = useQuery(api.calls.list, isAuthenticated ? undefined : "skip");

  const createCall = useMutation(api.calls.create);

  const isLoading = authLoading || calls === undefined;

  // Show loading while checking authentication
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <AuthSignIn />
      </div>
    );
  }

  const handleCallSelect = (callId: Id<"calls">) => {
    setActiveCallId(callId);
    router.push(`/call/${callId}`);
  };

  const handleNewCall = async () => {
    try {
      const callId = await createCall({
        title: `Call ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      });
      router.push(`/call/${callId}`);
    } catch (error) {
      console.error("Failed to create call:", error);
    }
  };

  const recentCalls = calls?.slice(0, 5) ?? [];

  return (
    <>
      <CallHistorySidebar
        activeCallId={activeCallId}
        onCallSelect={handleCallSelect}
      />

      <SidebarInset>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Record and analyze your conversations with AI-powered insights
              </p>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Start a new call recording session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-12 w-full sm:w-48" />
                ) : (
                  <Button
                    onClick={handleNewCall}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Start New Call
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Recent Calls
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ul className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </li>
                    ))}
                  </ul>
                ) : recentCalls.length === 0 ? (
                  <div className="text-center py-8">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No calls yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start your first call to see it here
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {recentCalls.map((call: Doc<"calls">) => (
                      <li
                        key={call._id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => handleCallSelect(call._id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {call.title}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(
                                  call._creationTime
                                ).toLocaleDateString()}
                              </span>
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(
                                  call._creationTime
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
