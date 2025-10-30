
import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeCardProps {
  product: {
    id: string;
    name: string;
  };
}

const QrCodeCard = ({ product }: QrCodeCardProps) => {
  const url = `https://pimpos-system.vercel.app/client/product/${product.id}`;

  return (
    <div className="p-4 bg-white rounded-lg text-center">
      <QRCodeCanvas value={url} size={128} />
      <p className="mt-2 font-bold">{product.name}</p>
      <p className="text-sm text-gray-500">{url}</p>
    </div>
  );
};

export default QrCodeCard;
