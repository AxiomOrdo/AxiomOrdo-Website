import * as React from "react";

function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`badge ${className || ""}`} {...props} />;
}

export { Badge };