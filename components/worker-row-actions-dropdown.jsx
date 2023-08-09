import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import WorkerProfileDialog from "./worker-profile-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { DialogTrigger } from "./ui/dialog";

const WorkerRowActionsDropdown = ({ worker }) => {
  return (
    <WorkerProfileDialog
      worker={worker}
      onDropdown
      dropdownMenu={
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="float-right">
            <Button variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/messages/${worker.id}`}
                className="flex gap-2"
              >
                <span>Message</span>
              </Link>
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <span>View Portfolio</span>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
};

export default WorkerRowActionsDropdown;
