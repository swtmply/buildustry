import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Star } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";

const Rate = ({ workerId, setOpen, projectId }) => {
  const queryClient = useQueryClient();
  const maxStars = 5;
  const [tempStar, setTempStar] = useState(0);
  const [rating, setRating] = useState(0);

  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { mutate: addRating } = useMutation(
    async () => {
      await axios.put(`/api/users/${workerId}`, {
        rating: rating,
      });
    },
    {
      onSuccess() {
        setOpen(false);
      },
    },
    {
      enabled: !!user,
    }
  );

  const { mutate: updateStatus } = useMutation(
    async () => {
      await axios.put(`/api/projects/${projectId}`, {
        isRated: true,
      });
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["projects", user.id]);
      },
    }
  );

  const onHover = (value) => {
    setTempStar(value);
  };
  const onClick = (value) => {
    setRating(value);
  };

  return (
    <div className="mt-6">
      <p className="justify-center">How was the service?</p>
      <div className="flex justify-center">
        {[...Array(maxStars)].map((_, index) => (
          <Star
            key={index}
            strokeWidth={1}
            size={24}
            className={cn(
              "fill-slate-300  text-transparent cursor-pointer",
              tempStar > index && "fill-yellow-500",
              rating > index && "fill-yellow-500"
            )}
            onMouseEnter={() => onHover(index + 1)}
            onMouseLeave={() => onHover(0)}
            onClick={() => onClick(index + 1)}
          />
        ))}
      </div>
      <Button
        className="bg-emerald-500 hover:bg-emerald-600 w-full mt-4"
        type="button"
        onClick={() => {
          addRating();
          updateStatus();
        }}
      >
        Submit
      </Button>
    </div>
  );
};

export default Rate;
