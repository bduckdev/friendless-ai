import Link from "next/link";
import { Card } from "~/components/ui/card";
import type { Friend } from "~/types";

interface FriendCardProps {
    friend: Friend
}

export function FriendCard({
    friend
}: FriendCardProps) {
    const { id, avatar, name, age, background } = friend

    return (
        <Link href={`/chat/${id}`}>
            <Card className="group relative aspect-[3/4] cursor-pointer overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-lg">
                {/* Background Image/Color */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400"
                    style={
                        avatar
                            ? {
                                backgroundImage: `url(${avatar})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }
                            : undefined
                    }
                >
                    {/* Overlay gradient for text readability - darker for better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>

                {/* Text Overlay (expanded to 50% for more backstory space) */}
                <div className="absolute right-0 bottom-0 left-0 max-h-[50%] overflow-hidden p-4 text-white">
                    <h3 className="mb-1 text-2xl font-bold tracking-tight">
                        {name}
                        {age && <span className="ml-2 font-extralight">{age}</span>}
                    </h3>
                    <p className="line-clamp-4 text-sm text-white/90">{background}</p>
                </div>

                {/* Hover effect - slight brightness increase */}
                <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/5" />
            </Card>
        </Link>
    );
}
