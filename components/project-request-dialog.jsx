import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import NewProjectForm from "./forms/new-project-form";
import { useState } from "react";

const ProjectRequestDialog = ({
  children,
  viewOnly = false,
  role,
  worker,
  project,
  onDropdown,
  dropdownMenu,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {project ? (
          <>
            {onDropdown && dropdownMenu}

            {!onDropdown && <DialogTrigger asChild>{children}</DialogTrigger>}
          </>
        ) : (
          children
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project</DialogTitle>
        </DialogHeader>
        <NewProjectForm
          setOpen={setOpen}
          viewOnly={viewOnly}
          role={role}
          worker={worker}
          project={project}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectRequestDialog;
