"use client";

import {
  CheckIcon,
  LoaderIcon,
  MailIcon,
  PhoneIcon,
  SaveIcon,
  SmartphoneIcon,
  TestTubeIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ChannelConfig = {
  id: string;
  type: string;
  isEnabled: boolean;
  config: Record<string, string>;
};

const CHANNEL_TYPES = [
  {
    type: "email",
    label: "Email (SMTP)",
    icon: <MailIcon className="size-3.5" />,
    description: "Send quotes, confirmations, and follow-ups via email",
    fields: [
      { key: "host", label: "SMTP Host", placeholder: "smtp.gmail.com" },
      { key: "port", label: "Port", placeholder: "587" },
      { key: "user", label: "Username", placeholder: "you@gmail.com" },
      { key: "pass", label: "Password", placeholder: "••••••••", type: "password" },
      { key: "from", label: "From Address", placeholder: "Lumina Chat <you@gmail.com>" },
    ],
  },
  {
    type: "whatsapp",
    label: "WhatsApp (Meta)",
    icon: <SmartphoneIcon className="size-3.5" />,
    description: "Reply and follow up with clients on WhatsApp",
    fields: [
      { key: "token", label: "Access Token", placeholder: "EAA...", type: "password" },
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789" },
      { key: "from", label: "From Number", placeholder: "+1234567890" },
    ],
  },
  {
    type: "twilio",
    label: "Phone Calls (Twilio)",
    icon: <PhoneIcon className="size-3.5" />,
    description: "Place outbound calls to clients",
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "AC..." },
      { key: "authToken", label: "Auth Token", placeholder: "••••••••", type: "password" },
      { key: "fromNumber", label: "From Number", placeholder: "+1234567890" },
    ],
  },
];

export function ChannelConfig({
  businessId,
  channels,
  onChannelsUpdated,
}: {
  businessId: string;
  channels: ChannelConfig[];
  onChannelsUpdated: (channels: ChannelConfig[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const handleEdit = (channel: ChannelConfig) => {
    setEditingId(channel.id);
    setFormData({ ...channel.config });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/business/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          config: formData,
          isEnabled: true,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Channel saved!");

      const updated = channels.map((c) =>
        c.id === editingId
          ? { ...c, config: formData, isEnabled: true }
          : c
      );
      onChannelsUpdated(updated);
      setEditingId(null);
    } catch {
      toast.error("Failed to save channel");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (channelType: string) => {
    setTesting(channelType);
    try {
      const res = await fetch("/api/business/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          type: channelType,
          config: channels.find((c) => c.type === channelType)?.config,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`${channelType} channel is working!`);
      } else {
        toast.error(data.error || `${channelType} test failed`);
      }
    } catch {
      toast.error("Test failed");
    } finally {
      setTesting(null);
    }
  };

  const handleToggle = async (channel: ChannelConfig) => {
    const newEnabled = !channel.isEnabled;
    try {
      await fetch("/api/business/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: channel.id,
          isEnabled: newEnabled,
        }),
      });
      onChannelsUpdated(
        channels.map((c) =>
          c.id === channel.id ? { ...c, isEnabled: newEnabled } : c
        )
      );
    } catch {
      toast.error("Failed to toggle channel");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {CHANNEL_TYPES.map((ct) => {
        const channel = channels.find((c) => c.type === ct.type);
        if (!channel) return null;
        const isEditing = editingId === channel.id;

        return (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 transition-all",
              channel.isEnabled
                ? "border-foreground/20 bg-muted/30"
                : "border-border/30"
            )}
            key={channel.id}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ct.icon}
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">{ct.label}</span>
                  <span className="text-[11px] text-muted-foreground/60">
                    {ct.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                    channel.isEnabled ? "bg-foreground" : "bg-muted-foreground/30"
                  )}
                  onClick={() => handleToggle(channel)}
                  type="button"
                >
                  <div
                    className={cn(
                      "absolute top-0.5 size-4 rounded-full bg-background transition-transform",
                      channel.isEnabled ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </div>

            {isEditing && (
              <div className="mt-3 flex flex-col gap-2">
                <Separator />
                {ct.fields.map((field) => (
                  <div className="flex flex-col gap-1" key={field.key}>
                    <Label className="text-[11px] text-muted-foreground">
                      {field.label}
                    </Label>
                    <Input
                      className="h-8 text-[12px]"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      type={field.type || "text"}
                      value={formData[field.key] || ""}
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setEditingId(null)}
                    size="sm"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-7 gap-1 px-2 text-[11px]"
                    disabled={saving}
                    onClick={handleSave}
                    size="sm"
                  >
                    {saving ? (
                      <LoaderIcon className="size-3 animate-spin" />
                    ) : (
                      <SaveIcon className="size-3" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="mt-2 flex gap-2">
                <Button
                  className="h-6 gap-1 px-2 text-[11px]"
                  onClick={() => handleEdit(channel)}
                  size="sm"
                  variant="ghost"
                >
                  Configure
                </Button>
                {channel.isEnabled && (
                  <Button
                    className="h-6 gap-1 px-2 text-[11px]"
                    disabled={testing === channel.type}
                    onClick={() => handleTest(channel.type)}
                    size="sm"
                    variant="ghost"
                  >
                    {testing === channel.type ? (
                      <LoaderIcon className="size-3 animate-spin" />
                    ) : (
                      <TestTubeIcon className="size-3" />
                    )}
                    Test
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
