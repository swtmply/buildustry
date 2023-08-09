import React from "react";
import { Card, CardContent } from "./ui/card";
import { Contact2, HardHat, Star } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import WorkerProfileDialog from "./worker-profile-dialog";
import ProjectRequestDialog from "./project-request-dialog";

const WorkerCard = ({ worker }) => {
  var imageUrl = worker.portfolio
    ? worker.portfolio.projects[0].images[0].url
    : "https://picsum.photos/seed/a/500/500";

  return (
    <WorkerProfileDialog worker={worker}>
      <Card className="flex flex-col gap-2 rounded-md cursor-pointer hover:bg-slate-50">
        <div className="w-56 aspect-square relative">
          <Image src={imageUrl} alt="" fill className="rounded-t-md" />
        </div>
        <CardContent className="flex flex-col gap-2 p-2">
          <div className="w-full flex justify-between">
            <div>
              <p className="font-bold text-xl max-w-[12ch] truncate">
                {worker.name}
              </p>
              <div className="flex gap-1 items-center">
                <Star size={24} className="fill-yellow-500 text-transparent" />
                <p className="font-semibold text-sm">
                  {(
                    worker.rating / worker.ratingCount ||
                    0 / worker.ratingCount ||
                    0
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">{`(${worker.ratingCount} Reviews)`}</p>
              </div>
            </div>
            {worker.role === "laborer" ? (
              <HardHat className="text-emerald-500" />
            ) : (
              <Contact2 className="text-emerald-500" />
            )}
          </div>
          <ProjectRequestDialog role={worker.role} worker={worker}>
            <Button
              onClick={(e) => e.stopPropagation()}
              className="bg-emerald-100 text-emerald-500 hover:bg-emerald-200"
            >
              Request Service
            </Button>
          </ProjectRequestDialog>
        </CardContent>
      </Card>
    </WorkerProfileDialog>
  );
};

export default WorkerCard;
