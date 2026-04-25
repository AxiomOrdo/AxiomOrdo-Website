import * as React from "react";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label className={`label ${className || ""}`} ref={ref} {...props} />
));
Label.displayName = "Label";

export { Label };