import React from "react";
import { TempoTab } from "./types";

type SidebarMenuProps = {
  isOpen: boolean;
  tabs: TempoTab[];
  activeTab: TempoTab;
  onClose: () => void;
  onSelectTab: (tab: TempoTab) => void;
};

// Displays the slide-out sidebar menu and lets users switch between Tempo feature tabs.
export function SidebarMenu({ isOpen, tabs, activeTab, onClose, onSelectTab }: SidebarMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        aria-label="Close navigation menu backdrop"
        className="fixed inset-0 z-30 bg-black/30"
        onClick={onClose}
        type="button"
      />
      <aside className="fixed left-0 top-0 z-40 h-full w-72 border-r bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Features</h2>
          <button className="rounded-md border px-2 py-1 text-sm hover:bg-slate-100" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                activeTab === tab ? "bg-slate-900 text-white" : "border hover:bg-slate-100"
              }`}
              onClick={() => onSelectTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
