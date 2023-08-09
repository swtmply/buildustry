import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { DialogTrigger } from "./ui/dialog";
import ProjectRequestDialog from "./project-request-dialog";

const ProjectRowActionsDropdown = ({ project }) => {
  return (
    <ProjectRequestDialog
      viewOnly={true}
      project={project}
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
                href={`/dashboard/messages/${project.clientId}`}
                className="flex gap-2"
              >
                <span>Message</span>
              </Link>
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem>
                <span>View Project</span>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
};

export default ProjectRowActionsDropdown;
