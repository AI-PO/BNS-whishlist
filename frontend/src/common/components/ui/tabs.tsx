"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) => {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
};

const TabsList = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) => {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  );
};

const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) => {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={className}
      {...props}
    />
  );
};

const TabsLinkTrigger = ({
  href,
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { href: string }) => {
  return (
    <TabsTrigger data-slot="tabs-link-trigger" className={className} {...props}>
      <Link href={href}>{children}</Link>
    </TabsTrigger>
  );
};

const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsLinkTrigger, TabsContent };
