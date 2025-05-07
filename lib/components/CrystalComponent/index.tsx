import { useEffect, useRef } from 'react';
import { Crystal } from './Crystal';

interface CrystalComponentProps {
  particleNumber?: number;
  red: number;
  green: number;
  blue: number;
  width: number;
  height: number;
  bgRed: number;
  bgGreen: number;
  bgBlue: number;
}

// should be a self contained Q5 instance
export function CrystalComponent(props: CrystalComponentProps) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const drawing = new Crystal(ref.current, {
      particleNumber: props.particleNumber || 15,
      color: {
        red: props.red,
        green: props.green,
        blue: props.blue,
      },
      backgroundColor: {
        red: props.bgRed,
        green: props.bgGreen,
        blue: props.bgBlue,
      },
    });
    return () => {
      drawing.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    // crystal component should be right here?
    <div
      style={{
        width: props.width,
        height: props.height,
        border: `1px solid rgb(${props.red},${props.green},${props.blue})`,
      }}
      ref={ref}
    ></div>
  );
}
