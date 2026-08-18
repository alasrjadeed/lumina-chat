"use client";

import {
  BuildingIcon,
  CheckIcon,
  GlobeIcon,
  LoaderIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChannelConfig } from "./channel-config";

type ScrapedService = {
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
};

type ScrapedBusiness = {
  name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website: string;
  hours: {
    open: string;
    close: string;
    days: string;
    timezone: string;
  };
  services: ScrapedService[];
};

type BusinessRecord = {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  timezone?: string;
  hoursOpen?: string;
  hoursClose?: string;
  hoursDays?: string;
  paymentTerms?: string;
  isActive: boolean;
};

type ChannelRecord = {
  id: string;
  businessId: string;
  type: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
};

function ScrapeModal({
  onScraped,
  onClose,
}: {
  onScraped: (data: ScrapedBusiness) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scrape failed");
      onScraped(data.data);
      toast.success("Business details extracted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border/50 bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-foreground/70" />
            <span className="text-sm font-medium">Add Business from Website</span>
          </div>
          <button
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <p className="mb-4 text-[12px] text-muted-foreground">
          Paste a website URL and AI will automatically extract business details, services, and pricing.
        </p>
        <div className="flex gap-2">
          <Input
            className="h-9 text-[13px]"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            placeholder="https://example.com"
            value={url}
          />
          <Button
            className="h-9 gap-1.5 px-3"
            disabled={loading || !url.trim()}
            onClick={handleScrape}
            size="sm"
          >
            {loading ? (
              <LoaderIcon className="size-3.5 animate-spin" />
            ) : (
              <SparklesIcon className="size-3.5" />
            )}
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BusinessForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ScrapedBusiness & { id?: string };
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    tagline: initial?.tagline || "",
    description: initial?.description || "",
    website: initial?.website || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    address: initial?.address || "",
    hoursOpen: initial?.hours?.open || "9:00",
    hoursClose: initial?.hours?.close || "18:00",
    hoursDays: initial?.hours?.days || "Monday - Friday",
    paymentTerms: "",
  });

  const [services, setServices] = useState<ScrapedService[]>(
    initial?.services || []
  );

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Business Name *</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("name", e.target.value)} value={form.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Website</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("website", e.target.value)} value={form.website} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Tagline</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("tagline", e.target.value)} value={form.tagline} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Email</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("email", e.target.value)} value={form.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Phone</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("phone", e.target.value)} value={form.phone} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Address</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("address", e.target.value)} value={form.address} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Description</Label>
          <textarea
            className="min-h-[60px] rounded-lg border border-border/50 bg-background px-3 py-2 text-[13px] outline-none focus:border-foreground/30"
            onChange={(e) => update("description", e.target.value)}
            value={form.description}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Hours Open</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("hoursOpen", e.target.value)} value={form.hoursOpen} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Hours Close</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("hoursClose", e.target.value)} value={form.hoursClose} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Work Days</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("hoursDays", e.target.value)} value={form.hoursDays} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label className="text-[11px] text-muted-foreground">Payment Terms</Label>
          <Input className="h-8 text-[13px]" onChange={(e) => update("paymentTerms", e.target.value)} value={form.paymentTerms} />
        </div>
      </div>

      {services.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] text-muted-foreground">
              Services ({services.length})
            </Label>
            <div className="flex flex-col gap-1.5">
              {services.map((s, i) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2"
                  key={i}
                >
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium">{s.name}</span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {s.category} · {s.price > 0 ? `$${s.price} ${s.unit}` : "Contact for pricing"}
                    </span>
                  </div>
                  <button
                    className="rounded p-1 text-muted-foreground/40 hover:text-destructive"
                    onClick={() => setServices((prev) => prev.filter((_, j) => j !== i))}
                    type="button"
                  >
                    <TrashIcon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button className="h-8 px-3 text-[12px]" onClick={onCancel} size="sm" variant="ghost">
          Cancel
        </Button>
        <Button
          className="h-8 px-3 text-[12px]"
          disabled={!form.name.trim()}
          onClick={() => onSave({ ...form, services })}
          size="sm"
        >
          {initial?.id ? "Update Business" : "Save Business"}
        </Button>
      </div>
    </div>
  );
}

function ChannelBadge({ type, enabled }: { type: string; enabled: boolean }) {
  const icons: Record<string, string> = {
    email: "📧",
    whatsapp: "📱",
    twilio: "☎️",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        enabled
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-muted text-muted-foreground/50"
      )}
    >
      {icons[type] || "🔗"} {type}
      {enabled ? " ✓" : ""}
    </span>
  );
}

export function BusinessSettings() {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [channels, setChannels] = useState<ChannelRecord[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [viewChannelsFor, setViewChannelsFor] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [scrapedData, setScrapedData] = useState<ScrapedBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = useCallback(async () => {
    try {
      const res = await fetch("/api/business");
      const data = await res.json();
      if (data.ok) {
        setBusinesses(data.businesses);
        if (data.channels) setChannels(data.channels);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const saved = localStorage.getItem("lumina-active-business");
  const activeId = activeBusinessId || saved || null;

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Save failed");
      toast.success("Business saved!");
      setView("list");
      setScrapedData(null);
      fetchBusinesses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this business? This cannot be undone.")) return;
    try {
      await fetch(`/api/business?id=${id}`, { method: "DELETE" });
      toast.success("Business deleted");
      if (activeId === id) {
        setActiveBusinessId(null);
        localStorage.removeItem("lumina-active-business");
      }
      fetchBusinesses();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSetActive = (id: string) => {
    setActiveBusinessId(id);
    localStorage.setItem("lumina-active-business", id);
    toast.success("Active business updated");
  };

  const getChannels = (businessId: string) =>
    channels.filter((c) => c.businessId === businessId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[12px] text-muted-foreground">
        <LoaderIcon className="mr-2 size-3.5 animate-spin" /> Loading businesses...
      </div>
    );
  }

  if (viewChannelsFor) {
    const biz = businesses.find((b) => b.id === viewChannelsFor);
    const bizChannels = getChannels(viewChannelsFor);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setViewChannelsFor(null)}
              type="button"
            >
              ←
            </button>
            <Label className="text-[12px] font-medium">
              Channels — {biz?.name}
            </Label>
          </div>
        </div>
        <ChannelConfig
          businessId={viewChannelsFor}
          channels={bizChannels.map((c) => ({
            id: c.id,
            type: c.type,
            isEnabled: c.isEnabled,
            config: (c.config as Record<string, string>) || {},
          }))}
          onChannelsUpdated={(updated) => {
            setChannels((prev) => {
              const without = prev.filter((c) => c.businessId !== viewChannelsFor);
              return [
                ...without,
                ...updated.map((u) => ({
                  ...channels.find((c) => c.id === u.id),
                  ...u,
                  businessId: viewChannelsFor,
                  config: u.config,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })),
              ];
            });
          }}
        />
      </div>
    );
  }

  if (view === "add") {
    return (
      <div className="flex flex-col gap-4">
        {scrapedData ? (
          <BusinessForm
            initial={scrapedData}
            onCancel={() => {
              setView("list");
              setScrapedData(null);
            }}
            onSave={handleSave}
          />
        ) : (
          <ScrapeModal
            onClose={() => setView("list")}
            onScraped={(data) => setScrapedData(data)}
          />
        )}
        {!scrapedData && (
          <div className="flex justify-center">
            <button
              className="text-[12px] text-muted-foreground/60 underline-offset-4 hover:underline"
              onClick={() => setScrapedData({ name: "", website: "", services: [] })}
              type="button"
            >
              Or add manually without scraping
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-[12px] font-medium text-muted-foreground">
          Businesses ({businesses.length})
        </Label>
        <Button
          className="h-7 gap-1 px-2 text-[11px]"
          onClick={() => setView("add")}
          size="sm"
        >
          <PlusIcon className="size-3" /> Add Business
        </Button>
      </div>

      {businesses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/50 py-10">
          <BuildingIcon className="size-8 text-muted-foreground/30" />
          <p className="text-[12px] text-muted-foreground/60">
            No businesses yet. Add your first business to get started.
          </p>
          <Button className="h-8 gap-1.5 px-3 text-[12px]" onClick={() => setView("add")} size="sm">
            <PlusIcon className="size-3.5" /> Add Business
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {businesses.map((b) => {
            const ch = getChannels(b.id);
            const isActive = activeId === b.id;
            return (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 transition-all",
                  isActive
                    ? "border-foreground/30 bg-muted/50 shadow-sm"
                    : "border-border/30 hover:border-border/60"
                )}
                key={b.id}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium">{b.name}</span>
                      {isActive && (
                        <StarIcon className="size-3 fill-foreground text-foreground" />
                      )}
                    </div>
                    {b.website && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                        <GlobeIcon className="size-3" /> {b.website}
                      </div>
                    )}
                    {b.email && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                        <MailIcon className="size-3" /> {b.email}
                      </div>
                    )}
                    {b.phone && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                        <PhoneIcon className="size-3" /> {b.phone}
                      </div>
                    )}
                    {ch.length > 0 && (
                      <div className="mt-1 flex gap-1.5">
                        {ch.map((c) => (
                          <ChannelBadge enabled={c.isEnabled} key={c.id} type={c.type} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => setViewChannelsFor(b.id)}
                      type="button"
                    >
                      Channels
                    </button>
                    {!isActive && (
                      <button
                        className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => handleSetActive(b.id)}
                        type="button"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => handleDelete(b.id)}
                      type="button"
                    >
                      <TrashIcon className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
