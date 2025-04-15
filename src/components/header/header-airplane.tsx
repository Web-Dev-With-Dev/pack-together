"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

export const HeaderAirplane = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(-50);

  useEffect(() => {
    const animate = () => {
      setIsVisible(true);
      setPosition(-50);
      
      const moveInterval = setInterval(() => {
        setPosition(prev => {
          if (prev > window.innerWidth) {
            clearInterval(moveInterval);
            setIsVisible(false);
            return -50;
          }
          return prev + 5;
        });
      }, 20);

      return () => clearInterval(moveInterval);
    };

    // Start animation immediately
    const initialAnimation = animate();

    // Set up interval for repeated animations
    const animationInterval = setInterval(() => {
      animate();
    }, 5000); // Repeat every 5 seconds

    return () => {
      clearInterval(animationInterval);
      initialAnimation && initialAnimation();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute top-2 transition-transform duration-100 z-50"
      style={{ 
        transform: `translateX(${position}px)`,
        willChange: "transform"
      }}
    >
      <Plane 
        className="text-blue-500 animate-pulse" 
        size={24}
        strokeWidth={1.5}
      />
    </div>
  );
}; 