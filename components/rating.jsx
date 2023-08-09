import { Star } from "lucide-react";
import React from "react";

const Rating = ({ value }) => {
  const maxStars = 5;
  const filledStars = Math.floor(value);
  const emptyStars = maxStars - filledStars;

  return (
    <div className="rating flex">
      {[...Array(filledStars)].map((_, index) => (
        <Star
          key={index}
          strokeWidth={1}
          size={24}
          className="fill-yellow-500 text-transparent"
        />
      ))}
      {[...Array(emptyStars)].map((_, index) => (
        <Star
          key={index}
          strokeWidth={1}
          size={24}
          className="fill-slate-300 text-transparent"
        />
      ))}
    </div>
  );
};

export default Rating;
