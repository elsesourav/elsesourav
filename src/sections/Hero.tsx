import memojiImage from "@/assets/images/memoji-computer.png"
import ArrowDown from "@/assets/icons/arrow-down.svg"
import Image from "next/image";
import greenImage from "@/assets/images/grain.jpg";
import StarIcon from "@/assets/icons/star.svg";
import SparkleIcon from "@/assets/icons/sparkle.svg";
import { HeroOrbit } from "@/components/HeroOrbit";

export const HeroSection = () => {
  return <div className="relative py-32 md:py-48 lg:py-60 z-0 overflow-x-clip">
    <div className="absolute inset-0 -z-30 opacity-5" style={{backgroundImage: `url(${greenImage.src})`}}></div>

    <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_70%,transparent)]">
      <div className="size-[550px] md:size-[650px] hero-ring"></div>
      <div className="size-[700px] md:size-[850px] hero-ring"></div>
      <div className="size-[850px] md:size-[1050px] hero-ring"></div>
      <div className="size-[1000px] md:size-[1250px] hero-ring"></div>

      <HeroOrbit size={650} rotation={-60}>
        <StarIcon className={`size-28 text-emerald-300`}/>
      </HeroOrbit>
      <HeroOrbit size={510} rotation={15}>
        <StarIcon className={`size-12 text-emerald-300`}/>
      </HeroOrbit>
      <HeroOrbit size={570} rotation={90}>
        <StarIcon className={`size-8 text-emerald-300`}/>
      </HeroOrbit>
      <HeroOrbit size={460} rotation={-15}>
        <SparkleIcon className={`size-8 text-emerald-300/20`}/>
      </HeroOrbit>
      <HeroOrbit size={455} rotation={80}>
        <SparkleIcon className={`size-5 text-emerald-300/20`}/>
      </HeroOrbit>
      <HeroOrbit size={540} rotation={180}>
        <SparkleIcon className={`size-10 text-emerald-300/20`}/>
      </HeroOrbit>
      <HeroOrbit size={680} rotation={145}>
        <SparkleIcon className={`size-10 text-emerald-300/20`}/>
      </HeroOrbit>

      <HeroOrbit size={650} rotation={85}>
        <div className="size-3 rounded-full bg-emerald-300/20"/>
      </HeroOrbit>
      <HeroOrbit size={510} rotation={-35}>
        <div className="size-2 rounded-full bg-emerald-300/20"/>
      </HeroOrbit>
      <HeroOrbit size={600} rotation={250}>
        <div className="size-2 rounded-full bg-emerald-300/20"/>
      </HeroOrbit>
      <HeroOrbit size={740} rotation={-20}>
        <div className="size-2 rounded-full bg-emerald-300/20"/>
      </HeroOrbit>
    </div> 

    <div className="container">
      <div className="flex flex-col items-center size-">
        <Image src={memojiImage} className="size-[100px]" alt="Person peeking from behind laptop" />
        <div className="bg-gray-950 border border-gray-800 px-4 py-1.5 inline-flex items-center gap-4 rounded-lg">
          <div className="bg-green-500 rounded-full size-2.5"></div>
          <div className="text-sm font-medium">Available for new projects</div>
        </div>
      </div>
      <div className="max-w-xl mx-auto">
        <h1 className="font-serif text-3xl md:text-5xl text-center mt-8 tracking-wide">Building a Exceptional User Experiences</h1>
        <p className="mt-4 text-center text-white/60 md:text-lg">
          Hi, I'm Sourav Barui, a passionate full-stack developer with 5+ years of experience.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center mt-8 gap-4">
        <button className="inline-flex items-center gap-2 border border-white/15 px-6 h-12 rounded-xl">
          <span className="font-semibold">Explore My Work</span>
          <ArrowDown className="size-4" />
        </button>
        <button className="inline-flex items-center gap-2 border-white bg-white text-gray-900 px-6 h-12 border rounded-xl">
          <span className="font-semibold">👋</span>
          <span>Let's Connect</span>
        </button>
      </div>
    </div>
  </div>;
};
