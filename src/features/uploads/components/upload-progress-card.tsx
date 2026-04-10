import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UploadProgressCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-slate-950 text-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 w-2/3 rounded-full bg-amber-400" />
        </div>
        <p className="mt-3 text-sm text-white/70">{description}</p>
      </CardContent>
    </Card>
  );
}
