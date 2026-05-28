"use client";

import { SITE_NAME } from "@/lib/constants";
import { NavMain } from "./nav-main";

export function AppSidebar() {
  return (
    <aside className="hidden border-r bg-card md:flex md:w-56 md:flex-col lg:w-64">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold">{SITE_NAME}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavMain />
      </div>
    </aside>
  );
}
