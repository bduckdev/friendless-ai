"use client"
import { Controller, useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import z from "zod";
import { Input } from "~/components/ui/input";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { handleProfileEdit } from "~/app/(client)/profile/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

export function ProfileEditModal() {
    const router = useRouter()
    const { data: session } = useSession()
    const formSchema = z.object({
        name: z.string().min(3).max(30),
        email: z.email().min(5).max(255),
        //image: z.string().min(3).max(255),
    })


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: session?.user.name ?? "",
            email: session?.user.email ?? "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await handleProfileEdit(data)
            toast.success("Profile successfully updated")
            router.refresh()
        } catch (e) {
            alert(e)
        }
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger className="" asChild>
                <Button variant="ghost">
                    <Pencil size={48} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Edit Profile
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Make changes to your profile here.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {/*actual form part*/}
                    <FieldGroup className="py-6">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invald={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="Your name here"
                                        id="name"
                                        aria-invalid={fieldState.invalid}
                                        type="text"
                                    />
                                    <FieldDescription>What your AI friends will call you.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invald={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            {...field}
                                            placeholder="foo@bar.com"
                                            id="email"
                                            aria-invalid={fieldState.invalid}
                                            type="email"
                                        />
                                    </FieldContent>
                                    <FieldDescription>{"Email for unimportant account updates and marketing materials you didn't ask for."}</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit">
                            Submit Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
