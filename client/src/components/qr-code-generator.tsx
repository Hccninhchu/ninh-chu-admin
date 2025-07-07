import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ data, size = 128, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('Error generating QR code:', error);
      });
    }
  }, [data, size]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`mx-auto ${className}`}
      width={size}
      height={size}
    />
  );
}
