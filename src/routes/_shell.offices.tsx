import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { offices } from "@/data/mock";

export const Route = createFileRoute("/_shell/offices")({
  head: () => ({
    meta: [
      { title: "Offices — LGU DocTrack" },
      { name: "description", content: "Directory of city hall offices participating in document routing." },
      { property: "og:title", content: "Offices — LGU DocTrack" },
      { property: "og:description", content: "Directory of city hall offices participating in document routing." },
    ],
  }),
  component: OfficesPage,
});

function OfficesPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Offices"
        description="Every office that can register, receive or release documents."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Add office
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add office</DialogTitle>
                <DialogDescription>Offices become available as routing destinations immediately.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oname">Office name</Label>
                  <Input id="oname" placeholder="City Legal Office" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ocode">Short code</Label>
                  <Input id="ocode" placeholder="CLO" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ohead">Office head</Label>
                  <Input id="ohead" placeholder="Atty. Juan Dela Cruz" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    setOpen(false);
                    toast.success("Office added (mock).");
                  }}
                >
                  Save office
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offices.map((o) => (
          <Card key={o.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-4 text-primary" aria-hidden />
                  <span className="truncate">{o.name}</span>
                </CardTitle>
                <CardDescription>{o.head}</CardDescription>
              </div>
              <Badge variant={o.active ? "secondary" : "outline"}>{o.active ? o.code : "Inactive"}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden /> {o.location}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden /> {o.contact}
              </p>
              <p className="flex items-center gap-2">
                <Users className="size-4" aria-hidden /> {o.staffCount} staff
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
