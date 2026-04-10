import { useNavigate } from "react-router-dom";

const AnnouncementBar = () => {
  const navigate = useNavigate();

  const text = "FREE DELIVERY ON ORDERS OVER KSH 3,000  •  SHOP OUR BESTSELLING DUOS  •  FREE DELIVERY ON ORDERS OVER KSH 3,000  •  SHOP OUR BESTSELLING DUOS  •  FREE DELIVERY ON ORDERS OVER KSH 3,000  •  SHOP OUR BESTSELLING DUOS  •  ";

  return (
    <div
      className="bg-fire-red text-white py-2 overflow-hidden cursor-pointer"
      onClick={() => navigate("/products")}
    >
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-xs font-semibold uppercase tracking-widest px-4">
          {text}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest px-4">
          {text}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
