"use client";

import { ChevronLeft, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { useChatContext } from "./chat-context";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

export function ChatHeader() {
    const { friend } = useChatContext();
    const router = useRouter()

    return (
        <div className="bg-background border-b">
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Back Button */}
                <Button className="rounded-full" onClick={() => router.push(`/friends`)} variant="ghost" size="icon" asChild>
                    <ChevronLeft className="size-5" />
                </Button>

                {/* Friend Info */}
                <div className="flex flex-1 flex-col items-center select-none">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Avatar className="size-10">
                                <AvatarImage src={friend.avatar ?? undefined} alt={friend.name} />
                                <AvatarFallback>
                                    {friend.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogCancel className="self-end">
                                    <X />
                                </AlertDialogCancel>
                                <AlertDialogTitle className="flex flex-col items-center">
                                    <Avatar className="size-24">
                                        <AvatarImage src={friend.avatar ?? undefined} alt={friend.name} />
                                        <AvatarFallback>
                                            {friend.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {friend.name}
                                </AlertDialogTitle>
                                <VisuallyHidden>
                                    <AlertDialogDescription>
                                        Edit friend modal
                                    </AlertDialogDescription>
                                </VisuallyHidden>
                            </AlertDialogHeader>
                            <Separator />
                            <ScrollArea className="max-h-56 md:max-h-full">
                                <div className="flex flex-col gap-2 py-2">
                                    <p className="text-xl font-semibold tracking-tight">Personality</p>
                                    <p className="">{friend.personality}</p>
                                </div>
                                <Separator />
                                <div className="flex flex-col gap-2 py-2">
                                    <p className="text-xl font-semibold tracking-tight">Traits</p>
                                    <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
                                        {friend.traits.map((trait) => (
                                            <Badge variant="secondary" className="my-1 h-5 min-w-5" key={trait}>{trait}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex flex-col gap-2 py-2">
                                    <p className="text-xl font-semibold tracking-tight">Interests</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3">
                                        {friend.interests.map((interest) => (
                                            <Badge variant="secondary" className="my-1 h-5 min-w-5" key={interest}>{interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex flex-col gap-2 py-2">
                                    <p className="text-xl font-semibold tracking-tight">Background</p>
                                    <p className="">{friend.background}</p>
                                </div>
                            </ScrollArea>
                        </AlertDialogContent>
                    </AlertDialog>
                    <span className="mt-1 text-sm ">{friend.name}</span>
                </div>

                {/* Spacer for centering */}
                <div className="size-9" />
            </div>
        </div >
    );
}
