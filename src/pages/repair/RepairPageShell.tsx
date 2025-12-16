import type { ReactNode } from "react";

import Heading from "../../components/element/Heading";
import { Card, CardContent } from "../../components/ui/card";

interface RepairPageShellProps {
  icon: ReactNode;
  heading: string;
  subtext: string;
  children: ReactNode;
}

export default function RepairPageShell({
  icon,
  heading,
  subtext,
  children,
}: RepairPageShellProps) {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="px-4 md:px-6 lg:px-8">
        <Heading heading={heading} subtext={subtext}>
          {icon}
        </Heading>
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
