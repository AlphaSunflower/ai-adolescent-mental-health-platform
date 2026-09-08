"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "./Button";
import type { Tone } from "./tone";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
});

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

/** Pouf tabs — a row of small clay buttons; the active one is held down. Same
 *  controlled/uncontrolled API as the cosmic ui/tabs so a page can swap the
 *  import without touching its state wiring. */
function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const handleChange = isControlled ? onValueChange! : setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap gap-2", className)} {...props} />;
}

function TabsTrigger({
  className,
  value,
  tone = "purple",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; tone?: Tone }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      className={cn(
        buttonClasses({ tone, size: "sm", variant: isActive ? "solid" : "quiet" }),
        className,
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onValueChange(value)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return <div className={cn("pt-5", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
