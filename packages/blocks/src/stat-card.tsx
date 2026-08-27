import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

type StatCardProps = {
  title: string;
  description?: string;
  value?: string;
  change?: string;
  changeVariant?: "default" | "secondary" | "destructive" | "outline";
  loading?: boolean;
  id?: string;
};

/**
 * StatCard — exemplar block composing Card + Badge + Skeleton.
 * Uses full Card composition, semantic tokens only, gap-based layout,
 * and size-* for equal dimensions. No arbitrary colors.
 */
export function StatCard({
  title,
  description,
  value,
  change,
  changeVariant = "secondary",
  loading = false,
  id,
}: StatCardProps) {
  if (loading) {
    return (
      <Card id={id}>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className="truncate text-sm">{title}</CardTitle>
        {description ? (
          <CardDescription className="truncate">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <span className="font-heading font-semibold text-2xl tracking-tight">
            {value}
          </span>
          {change ? <Badge variant={changeVariant}>{change}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
