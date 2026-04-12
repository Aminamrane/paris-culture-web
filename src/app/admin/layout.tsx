import BottomTabs from "@/components/layout/BottomTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomTabs />
    </>
  );
}
