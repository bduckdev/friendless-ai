"use client"
import { useRef } from "react"
import Autoplay from "embla-carousel-autoplay"
import { TEST_FRIENDS } from "~/lib/test-data"
import { Card, CardContent } from "~/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel"
import { FriendCard } from "./friends/friend-card"

export function FriendCarousel() {
    const plugin = useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full "
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {TEST_FRIENDS.map((f) => (
                    <CarouselItem className="basis-1/3" key={f.id + f.name}>
                        <FriendCard friend={f} isSmall />
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}

