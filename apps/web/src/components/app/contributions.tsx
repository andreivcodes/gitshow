"use client";

import Image from "next/image";
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
      "only screen and (max-width: 760px)",
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

  return (
    <div
      ref={chartRef}
      className="bg-black rounded-lg relative h-[16em] mx-4 w-full max-w-[500px] 2xl:max-w-[30em] flex items-center justify-center chart-shadow chart-fade"
      style={{
        ...rotationStyles,
        transformStyle: "preserve-3d",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute w-auto h-auto rounded-t-lg left-1/2 transform -translate-x-1/2 bottom-[3em]"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <Image
        className="absolute rounded-full bottom-[4em] left-[1em] w-[5em] h-[5em]"
        src={picture}
        quality={100}
        width={135}
        height={135}
        alt={twittertag}
      />

      <div className="absolute flex bottom-[1em] left-[1em] flex-col justify-start">
        <p className="font-extrabold text-md">{name}</p>
        <p className="font-thin text-sm">{twittertag}</p>
      </div>
    </div>
  );
}
