import { Badge } from "./badge";

export function EnvBadge({ environment }: { environment: "paper" | "live" }) {
  if (environment === "live") {
    return (
      <Badge variant="solid" size="sm">
        LIVE
      </Badge>
    );
  }
  return (
    <Badge variant="accent" size="sm">
      PAPER
    </Badge>
  );
}
