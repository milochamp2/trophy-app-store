"use client";

import { useState } from "react";
import { Copy, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { InviteCodeForm } from "@/components/forms/invite-code-form";
import { deactivateInviteCode } from "@/server/actions/memberships";
import { formatDate } from "@/lib/utils";
import type { InviteCode } from "@/db/database.types";

interface InviteCodesSectionProps {
  tenantId: string;
  inviteCodes: InviteCode[];
}

export function InviteCodesSection({
  tenantId,
  inviteCodes,
}: InviteCodesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const activeInviteCodes = inviteCodes.filter((code) => {
    if (!code.is_active) return false;
    if (code.expires_at && new Date(code.expires_at) < new Date()) return false;
    if (code.max_uses && code.uses_count >= code.max_uses) return false;
    return true;
  });

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  const handleDeactivate = async (codeId: string) => {
    const result = await deactivateInviteCode(codeId);

    if (result.success) {
      toast({
        title: "Code deactivated",
        description: "The invite code has been deactivated.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Invite Codes</CardTitle>
          <CardDescription>
            Generate invite codes to add new members
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Generate Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Invite Code</DialogTitle>
              <DialogDescription>
                Create a new invite code for members to join your club.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <InviteCodeForm
                tenantId={tenantId}
                onSuccess={() => setDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {activeInviteCodes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active invite codes. Generate one to invite new members.
          </p>
        ) : (
          <div className="space-y-3">
            {activeInviteCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-lg">
                      {code.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copiedCode === code.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize">
                      {code.role_default}
                    </Badge>
                    {code.max_uses && (
                      <span>
                        {code.uses_count}/{code.max_uses} uses
                      </span>
                    )}
                    {code.expires_at && (
                      <span>Expires: {formatDate(code.expires_at)}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeactivate(code.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
