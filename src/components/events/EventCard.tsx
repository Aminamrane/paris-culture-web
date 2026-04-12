import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";

interface EventCardProps {
  id: string;
  title: string;
  leadText?: string | null;
  coverUrl?: string | null;
  dateStart?: string | null;
  priceType?: string | null;
  category?: string | null;
  addressName?: string | null;
}

export default function EventCard({
  id,
  title,
  leadText,
  coverUrl,
  dateStart,
  priceType,
  category,
  addressName,
}: EventCardProps) {
  return (
    <Link
      href={`/events/${id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <span className="text-4xl opacity-50">🎭</span>
          </div>
        )}
        {category && (
          <span className="absolute top-2 left-2 text-xs font-medium bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {category}
          </span>
        )}
        {priceType === "FREE" && (
          <span className="absolute top-2 right-2 text-xs font-medium bg-green-500 text-white px-2 py-0.5 rounded-full">
            Gratuit
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-orange-600 transition-colors">
          {truncate(title, 60)}
        </h3>
        {leadText && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {truncate(leadText, 100)}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          {dateStart && <span>{formatDate(dateStart)}</span>}
          {addressName && <span className="truncate ml-2">{addressName}</span>}
        </div>
      </div>
    </Link>
  );
}
