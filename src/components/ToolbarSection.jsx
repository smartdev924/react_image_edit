import React from "react";

export const ToolbarSection = ({ title, children }) => {
  return (
    <section>
      <h5 className="mb-2 capitalize text-sm">{title}</h5>
      {children}
    </section>
  );
};
