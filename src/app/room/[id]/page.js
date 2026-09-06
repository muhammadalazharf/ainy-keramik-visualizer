import { notFound } from "next/navigation";
import RoomVisualizer from "@/modules/visualizer/RoomVisualizer";
import { getRoomById, getAllRooms } from "@/lib/data/rooms";

export function generateStaticParams() {
  return getAllRooms().map((r) => ({ id: r.id }));
}

export default async function RoomPage({ params }) {
  const { id } = await params;
  const room = getRoomById(id);
  if (!room) return notFound();

  return <RoomVisualizer room={room} />;
}
