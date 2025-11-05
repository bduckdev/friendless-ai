"use client";

import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useChatContext } from "./chat-context";
import { Spinner } from "../ui/spinner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useRef, useEffect } from "react";

export function ChatInput() {
    const formSchema = z.object({
        message: z.string().min(5).max(1500),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const msg = data.message;
        try {
            await handleSendMessage(msg);
            form.reset({ message: "" });
        } catch (error) {
            form.setValue("message", msg);
            toast.error("Uh oh! something went wrong. Try again later.");
            console.error("Error: ", error);
        }
    }

    const { handleSendMessage, isLoading } = useChatContext();

    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const baseHeightRef = useRef<number | null>(null);

    useEffect(() => {
        const el = textAreaRef.current;
        if (el) {
            el.style.height = "auto";
            baseHeightRef.current = el.scrollHeight;
            el.style.overflowY = "hidden";
        }
    }, []);

    function autoResize() {
        const el = textAreaRef.current;
        if (!el) return;

        const baseHeight = baseHeightRef.current ?? 0;

        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;

        const isSingleLine = el.scrollHeight <= baseHeight + 2;
        el.style.overflowY = isSingleLine ? "hidden" : "auto";
    }

    return (
        <div className="bg-background border-t p-4">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center gap-2"
            >
                <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invald={fieldState.invalid}>
                            <Textarea
                                {...field}
                                placeholder="Message..."
                                id="message"
                                ref={textAreaRef}
                                aria-invalid={fieldState.invalid}
                                disabled={isLoading}
                                onChange={(e) => {
                                    field.onChange(e);
                                    autoResize();
                                }}
                                rows={1}
                                className="field-sizing-fixed max-h-40 min-h-10 resize-none overflow-y-hidden rounded-2xl transition-all"
                            />
                        </Field>
                    )}
                />
                {!isLoading ? (
                    <Button
                        type="submit"
                        size="icon"
                        className="shrink-0 rounded-full"
                        disabled={isLoading}
                    >
                        <Send className="size-4" />
                    </Button>
                ) : (
                    <Spinner className="size-8" />
                )}
            </form>
        </div>
    );
}
