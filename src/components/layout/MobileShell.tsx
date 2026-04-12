"use client";

import BottomTabs from "./BottomTabs";

interface MobileShellProps {
  children: React.ReactNode;
  showTabs?: boolean;
}

export default function MobileShell({ children, showTabs = true }: MobileShellProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-stone-50">
      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{
          paddingTop: "calc(12px + var(--safe-top))",
          paddingBottom: showTabs ? "var(--tab-height)" : "var(--safe-bottom)",
        }}
      >
        {children}
      </div>

      {showTabs && <BottomTabs />}
    </div>
  );
}
