import React from "react";
import { clsx } from "clsx";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  fluid = false,
}) => {
  return (
    <div
      className={clsx(
        "w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10",
        fluid ? "max-w-full" : "max-w-[1360px]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
