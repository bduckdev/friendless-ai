import { Card } from "~/components/ui/card";
import type { Friend } from "~/types";

interface FriendCardProps {
    friend: Friend
}

export function FriendCard({
    friend
}: FriendCardProps) {
    const { avatar, name, age, background } = friend

    return (
        <Card className="text-left group relative aspect-[7/10] cursor-pointer overflow-hidden border-0 transition-all">
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
                <p className="line-clamp-4 text-sm text-white/85">{background}</p>
            </div>

        </Card>
    );
}
