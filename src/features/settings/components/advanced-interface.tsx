"use client";

import { useState } from "react";
import { LogOut, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Session {
  id: string;
  device: string;
  location: string;
  status: "current" | "active";
  lastActive: string;
  createdAt: Date;
  expiresAt: Date;
}

export const AdvancedInterface = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery(
    trpc.userSettings.getSessions.queryOptions()
  );

  const deleteSessionMutation = useMutation(
    trpc.userSettings.deleteSession.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.userSettings.getSessions.queryOptions());
        toast.success("Session logged out successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to logout session");
      },
    })
  );

  const deleteAllSessionsMutation = useMutation(
    trpc.userSettings.deleteAllSessions.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.userSettings.getSessions.queryOptions());
        toast.success("All other sessions logged out successfully");
        setShowLogoutAllDialog(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to logout all sessions");
      },
    })
  );

  const deleteAccountMutation = useMutation(
    trpc.userSettings.deleteAccount.mutationOptions({
      onSuccess: () => {
        toast.success("Account deleted successfully");
        router.push("/login");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete account");
        setIsDeleting(false);
      },
    })
  );

  const handleLogoutAll = () => {
    setShowLogoutAllDialog(true);
  };

  const handleLogoutSession = (sessionId: string) => {
    deleteSessionMutation.mutate({ sessionId });
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const confirmLogoutAll = () => {
    deleteAllSessionsMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Advanced</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage additional controls for your account, security, and preferences.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Active Sessions Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Active Sessions
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              See where your account is signed in and log out of individual or all sessions to keep your account secure.
            </p>
          </div>

          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-4 sm:mb-6">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg gap-4 sm:gap-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        session.status === "current" ? "bg-green-500" : "bg-gray-400"
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {session.device} {session.status === "current" && "(Current)"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {session.status !== "current" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogoutSession(session.id)}
                        disabled={deleteSessionMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {sessions.filter(s => s.status !== "current").length > 0 && (
                <Button
                  onClick={handleLogoutAll}
                  disabled={deleteAllSessionsMutation.isPending}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Log out of all sessions
                </Button>
              )}
            </>
          )}
        </div>

        {/* Logout Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Sign Out
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Sign out of your current session. You will need to sign in again to access your account.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/login");
                },
              }
            })}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Delete Account
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete my account"}
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout All Sessions Confirmation Dialog */}
      <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of all sessions</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out of all other devices and browsers. You will remain logged in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogoutAll}>
              Log out all sessions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
