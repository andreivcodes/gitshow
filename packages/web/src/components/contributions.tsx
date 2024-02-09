"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Contributions({
  name,
  twittertag,
  picture,
  svg,
}: {
  name: string;
  twittertag: string;
  picture: string;
  svg: string;
}) {
  const [rotationStyles, setRotationStyles] = useState<React.CSSProperties>({});
  const chartRef = useRef<HTMLDivElement>(null);

  const [url, setUrl] = useState("");

  useEffect(() => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    setUrl(url);
  }, [svg]);

  const tiltEffectSettings = {
    maxx: 15,
    maxy: 15,
    perspective: 1000,
    scale: 1,
    speed: 10,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  };

  useEffect(() => {
    const isMobile = window.matchMedia(
      "only screen and (max-width: 760px)"
    ).matches;

    if (isMobile) {
      return;
    }

    let lastTime = 0;
    const throttle = 10;

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const now = new Date().getTime();
        if (now - lastTime < throttle) return;
        lastTime = now;

        if (chartRef.current) {
          const chartRect = chartRef.current.getBoundingClientRect();
          const centerX = chartRect.left + chartRect.width / 2;
          const centerY = chartRect.top + chartRect.height / 2;

          const mouseX = e.clientX - centerX;
          const mouseY = e.clientY - centerY;
          const rotateXUncapped =
            (-1 * tiltEffectSettings.maxx * mouseY * 2) /
            (chartRect.height / 2);
          const rotateYUncapped =
            (+1 * tiltEffectSettings.maxy * mouseX) / (chartRect.height / 2);
          const rotateX =
            rotateXUncapped < -tiltEffectSettings.maxx
              ? -tiltEffectSettings.maxx
              : rotateXUncapped > tiltEffectSettings.maxx
              ? tiltEffectSettings.maxx
              : rotateXUncapped;
          const rotateY =
            rotateYUncapped < -tiltEffectSettings.maxy
              ? -tiltEffectSettings.maxy
              : rotateYUncapped > tiltEffectSettings.maxy
              ? tiltEffectSettings.maxy
              : rotateYUncapped;

          setRotationStyles({
            transform: `perspective(${tiltEffectSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) 
                          scale3d(${tiltEffectSettings.scale}, ${tiltEffectSettings.scale}, ${tiltEffectSettings.scale})`,
            transition: `transform ${tiltEffectSettings.speed}s ${tiltEffectSettings.easing}`,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!url) {
    return (
      <div className="relative h-[16em] mx-4 2xl:w-[30em] min-w-[500px] flex items-center justify-center"></div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="bg-black rounded-lg relative h-[16em] mx-4 w-[500px] 2xl:w-[30em] min-w-[500px] flex items-center justify-center chart-shadow chart-fade"
      style={{
        ...rotationStyles,
        transformStyle: "preserve-3d",
      }}
    >
      <picture>
        <img
          className={
            "absolute w-auto h-auto rounded-t-lg left-1/2 transform -translate-x-1/2 bottom-[6em]"
          }
          src={url}
          width={500}
          height={250}
          alt="Contributions Chart"
        />
      </picture>

      <Image
        className="absolute rounded-full bottom-[4em] left-[1em] w-[5em] h-[5em]"
        src={picture}
        quality={100}
        width={135}
        height={135}
        alt="Linus Torvalds"
      />

      <div className="absolute flex bottom-[1em] left-[1em] flex-col justify-start">
        <p className="font-extrabold text-md">{name}</p>
        <p className="font-thin text-sm">{twittertag}</p>
      </div>
    </div>
  );
}
