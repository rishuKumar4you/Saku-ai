"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    senderEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
    subjectFilter: z.string().optional(),
    enabled: z.boolean(),
});

export type FormType = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultSenderEmail?: string;
    defaultSubjectFilter?: string;
    defaultEnabled?: boolean;
};

export const EmailTriggerDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultSenderEmail = "",
    defaultSubjectFilter = "",
    defaultEnabled = true,
}: Props) => { 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            senderEmail: defaultSenderEmail,
            subjectFilter: defaultSubjectFilter,
            enabled: defaultEnabled,
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(() => {
        if (open) {
            form.reset({
                senderEmail: defaultSenderEmail,
                subjectFilter: defaultSubjectFilter,
                enabled: defaultEnabled,
            });
        }
    }, [open, defaultSenderEmail, defaultSubjectFilter, defaultEnabled, form]);
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Email Trigger Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure when this trigger should activate based on incoming emails.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Enable Email Trigger
                                        </FormLabel>
                                        <FormDescription>
                                            Activate this trigger to monitor for new emails.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="senderEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Sender Email Filter (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="sender@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Only trigger on emails from this specific sender. Leave empty to trigger on emails from any sender.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subjectFilter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Subject Filter (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Important, Urgent, etc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Only trigger on emails containing this text in the subject line. Leave empty to trigger on any subject.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
