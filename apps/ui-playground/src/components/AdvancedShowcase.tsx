import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@workspace/ui/components/item";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

export function AdvancedShowcase() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Avatar — missing image fallback */}
        <div
          className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
          data-state-frame="playground-avatar"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-medium text-sm tracking-tight">
              Avatar — fallback
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Missing image and src empty both show fallback; image has alt.
            </p>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              playground-avatar
            </span>
          </div>
          <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage
                    alt="Synevo"
                    src="https://example.invalid/missing.jpg"
                  />
                  <AvatarFallback>SY</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">Synevo</p>
                  <p className="truncate text-muted-foreground text-xs">
                    Logo lipsă → fallback vizibil
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage alt="Invitro" src="" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <span className="text-sm">Invitro — src gol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — trigger inside TabsList */}
        <div
          className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
          data-state-frame="playground-tabs"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-medium text-sm tracking-tight">
              Tabs — Trigger inside TabsList
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              playground-tabs
            </span>
          </div>
          <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list">Listă</TabsTrigger>
                <TabsTrigger value="compare">Compară</TabsTrigger>
                <TabsTrigger value="saved">Salvate</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                <p className="text-muted-foreground text-sm">
                  Lista de analize — 1 723 disponibile.
                </p>
              </TabsContent>
              <TabsContent value="compare">
                <p className="text-muted-foreground text-sm">
                  Compară prețuri între laboratoare.
                </p>
              </TabsContent>
              <TabsContent value="saved">
                <p className="text-muted-foreground text-sm">
                  Nicio listă salvată.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Select — Group + Item */}
        <div
          className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
          data-state-frame="playground-select"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-medium text-sm tracking-tight">
              Select — Group + Item
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Items inside Group, uses label.
            </p>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              playground-select
            </span>
          </div>
          <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
            <div className="flex flex-col gap-2">
              <label
                className="font-medium text-xs"
                htmlFor="playground-lab-select"
              >
                Laborator
              </label>
              <Select>
                <SelectTrigger
                  aria-label="Alege laboratorul"
                  id="playground-lab-select"
                >
                  <SelectValue placeholder="Alege laboratorul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Laboratoare</SelectLabel>
                    <SelectItem value="synevo">Synevo</SelectItem>
                    <SelectItem value="invitro">Invitro</SelectItem>
                    <SelectItem value="alfa">Alfa</SelectItem>
                    <SelectItem value="sante">Sante</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Accordion — no positive tabindex */}
          <div
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
            data-state-frame="playground-accordion"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-medium text-sm tracking-tight">
                Accordion
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground/70">
                playground-accordion
              </span>
            </div>
            <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
              <Accordion>
                <AccordionItem value="1">
                  <AccordionTrigger>
                    Ce include hemoleucograma?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-sm">
                      22 parametri + formulă leucocitară.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionTrigger>Cât durează rezultatele?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-sm">
                      24–48 ore lucrătoare.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Item — structured */}
          <div
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
            data-state-frame="playground-item"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-medium text-sm tracking-tight">
                Item — structured
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground/70">
                playground-item
              </span>
            </div>
            <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
              <div className="flex flex-col gap-3">
                <Item>
                  <ItemHeader>
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted font-medium text-xs">
                      AL
                    </div>
                  </ItemHeader>
                  <ItemContent>
                    <ItemTitle>Alfa Diagnostica</ItemTitle>
                    <ItemDescription>
                      145 filiale · prețuri de la 80 MDL
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button size="sm" variant="outline">
                      Vezi
                    </Button>
                  </ItemActions>
                </Item>
                <Separator />
                <Item>
                  <ItemContent>
                    <ItemTitle>Profil Tiroidian</ItemTitle>
                    <ItemDescription>TSH, FT4, Anti-TPO</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge>890 MDL</Badge>
                  </ItemActions>
                </Item>
              </div>
            </div>
          </div>

          {/* ScrollArea — local scroll */}
          <div
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
            data-state-frame="playground-scrollarea"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-heading font-medium text-sm tracking-tight">
                ScrollArea — local, not document overflow
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground/70">
                playground-scrollarea
              </span>
            </div>
            <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
              <ScrollArea className="h-32 rounded-lg border">
                <div className="flex flex-col gap-2 p-3">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2"
                      key={i}
                    >
                      <span className="truncate text-xs">
                        Analiză {i + 1} — Glucoză serică
                      </span>
                      <Badge className="shrink-0" variant="secondary">
                        {100 + i * 10} MDL
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Pagination — separate row */}
        <div
          className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
          data-state-frame="playground-pagination"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-medium text-sm tracking-tight">
              Pagination
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              playground-pagination
            </span>
          </div>
          <div className="min-w-0 rounded-lg border border-dashed bg-background p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
