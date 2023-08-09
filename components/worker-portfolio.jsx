import Image from "next/image";
import React, { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import AddPortfolioProjectForm from "./forms/add-portfolio-project-form";

const WorkerPortfolio = ({ portfolio, userIsWorker = false }) => {
  const [open, setOpen] = useState(false);

  if (!portfolio.projects && userIsWorker)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Project to Portfolio</Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
          </DialogHeader>
          <AddPortfolioProjectForm setOpen={setOpen} firstTime />
        </DialogContent>
      </Dialog>
    );

  return (
    <>
      {userIsWorker && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Project to Portfolio</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Project</DialogTitle>
            </DialogHeader>
            <AddPortfolioProjectForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      )}
      {portfolio.projects ? (
        // <ScrollArea
        //   className="w-full"
        //   viewportClassName="max-h-[20rem]"
        //   orientation="vertical"
        // >
        <>
          {portfolio.projects.map((project) => (
            <div
              key={project.name}
              className="flex flex-col gap-2 mb-4 max-w-lg border rounded-md p-2 shadow-md"
            >
              <p className="texl-lg font-semibold">{project.name}</p>
              <ScrollArea orientation="horizontal">
                <div className="flex gap-2">
                  {project.images.length > 0 ? (
                    project.images.map((image) => (
                      <div key={image.url} className="relative w-32 h-32">
                        <Image alt="" src={image.url} fill />
                      </div>
                    ))
                  ) : (
                    <p className="italic text-sm">
                      No images found for this project.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </>
      ) : (
        // </ScrollArea>
        <p className="italic text-sm">
          This worker does not have any project yet.
        </p>
      )}
    </>
  );
};

export default WorkerPortfolio;
