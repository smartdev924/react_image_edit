import clsx from "clsx";

export function Line({ name, refs }) {
  const className = clsx(
    "cropzone-transition pointer-events-none absolute left-0 top-0 bg-white/50",
    name.startsWith("lineHor") ? "h-px" : "w-px"
  );
  return (
    <div
      className={className}
      ref={(el) => {
        refs.current[name] = el;
      }}
    />
  );
}
