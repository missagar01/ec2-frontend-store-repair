import { SidebarProvider as LayoutSidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { SidebarProvider as UISidebarProvider } from "@/components/ui/sidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen w-full xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 w-full min-w-0 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main className="w-full min-h-[calc(100vh-64px)] overflow-x-hidden">
          <div className="w-full pl-4 md:pl-6 lg:pl-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <LayoutSidebarProvider>
      <UISidebarProvider>
        <LayoutContent />
      </UISidebarProvider>
    </LayoutSidebarProvider>
  );
};

export default AppLayout;
