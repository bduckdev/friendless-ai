"use client"
import type { Friend } from "~/types"
import { FriendCard } from "./friend-card"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

type SwipeGalleryProps = {
    friends: Friend[]
}

export function SwipeGallery({ friends }: SwipeGalleryProps) {
    const { data: session } = useSession()
    const [cards, setCards] = useState<Friend[]>(friends);
    const router = useRouter()

    function handleLeftSwipe() {
        setCards((prev) => [prev[prev.length - 1]!, ...prev.slice(0, -1)])
    }

    function handleRightSwipe(id: string) {
        if (!session?.user.name) {
            router.push("/api/auth/signin")
            return
        }
        router.push(`/chat/${id}`)
    }


    return (
        <div className="h-full grid grid-cols-1 place-items-center">
            {cards.map((friend, i) => (
                <SwipeCard i={i} isFront={i === cards.length - 1} handleLeftSwipe={handleLeftSwipe} handleRightSwipe={handleRightSwipe} key={friend.id} friend={friend} />
            ))}
        </div>
    )
}

type SwipeCardProps = {
    friend: Friend
    i: number
    isFront: boolean
    handleLeftSwipe: () => void
    handleRightSwipe: (id: string) => void
}

function SwipeCard({ friend, i, isFront, handleLeftSwipe, handleRightSwipe, }: SwipeCardProps) {
    const x = useMotionValue(0)
    const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0])
    const rotateRaw = useTransform(x, [-150, 150], [-18, 18])

    const rotate = useTransform(() => {
        const offset = isFront ? 0 : i % 2 ? 6 : -6

        return `${rotateRaw.get() + offset}deg`
    })

    function handleDragEnd() {
        if (x.get() > 50) {
            handleRightSwipe(friend.id)
        } else if (x.get() < -50) {
            handleLeftSwipe()
        }
    }

    return (
        <motion.div
            className="hover:cursor-grab active:cursor-grabbing w-72 origin-bottom select-none"
            style={{
                gridRow: 1,
                gridColumn: 1,
                x,
                opacity,
                rotate,
                boxShadow: isFront
                    ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
                    : undefined,
                transition: "0.125s transform",
            }}
            animate={{
                scale: isFront ? 1 : 0.98,
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{
                left: 0,
                right: 0,
            }}
            onDragEnd={handleDragEnd}
        >
            <FriendCard friend={friend} />
        </motion.div>
    )
}

