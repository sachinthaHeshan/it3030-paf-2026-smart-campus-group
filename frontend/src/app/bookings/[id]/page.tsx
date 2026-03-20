import BookingDetailClient from "./BookingDetailClient";

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }, { id: "6" }];
}

export default function BookingDetailPage() {
  return <BookingDetailClient />;
}
