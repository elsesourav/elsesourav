import { PropsWithChildren } from "react";
import grainImage from "@/assets/images/grain.jpg";
import { twMerge } from "tailwind-merge";

export const Card = ({ children, className }: PropsWithChildren <{ className?: string,  }>) => {
   return (
   <div className={ twMerge("relative bg-gray-800 rounded-3xl z-0 overflow-hidden after:content-[''] after:absolute after:inset-0 after:outline-2 after:outline after:-outline-offset-2 after:-z-10 after:rounded-[inherit] after:outline-white/20 after:pointer-events-none p-6", className) }>

      <div className="absolute inset-0 -z-10 opacity-5" style={{
      backgroundImage: `url(${grainImage.src})`
      }}></div>
      {children}
   </div>
   );
};


