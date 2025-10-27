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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    receiverEmail: z.string().email("Please enter a valid receiver email address"),
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
    useTemplate: z.boolean(),
    template: z.string().optional(),
});

export type FormType = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    nodeId?: string;
    defaultReceiverEmail?: string;
    defaultSubject?: string;
    defaultContent?: string;
    defaultUseTemplate?: boolean;
    defaultTemplate?: string;
};

export const EmailDialog = ({
    open,
    onOpenChange,
    onSubmit,
    nodeId,
    defaultReceiverEmail = "",
    defaultSubject = "",
    defaultContent = "",
    defaultUseTemplate = false,
    defaultTemplate = "",
}: Props) => { 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            receiverEmail: defaultReceiverEmail,
            subject: defaultSubject,
            content: defaultContent,
            useTemplate: defaultUseTemplate,
            template: defaultTemplate,
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(() => {
        if (open) {
            form.reset({
                receiverEmail: defaultReceiverEmail,
                subject: defaultSubject,
                content: defaultContent,
                useTemplate: defaultUseTemplate,
                template: defaultTemplate,
            });
        }
    }, [open, defaultReceiverEmail, defaultSubject, defaultContent, defaultUseTemplate, defaultTemplate, form]);

    const watchUseTemplate = form.watch("useTemplate");
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Email Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure email settings for sending emails via Google SMTP.
                    </DialogDescription>
                    {nodeId && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                            <p className="text-sm font-mono">
                                <span className="font-medium">Node ID:</span> {nodeId}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                This node receives data from previous nodes
                            </p>
                        </div>
                    )}
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 mt-4"
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="receiverEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Receiver Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="receiver@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Email address that will receive the message.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Subject
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Email subject line"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Subject line for the email. Use {"{{previousNode.content}}"} to reference content from previous nodes.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="useTemplate"
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
                                            Use Template
                                        </FormLabel>
                                        <FormDescription>
                                            Use a template for the email content instead of plain text.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {watchUseTemplate ? (
                            <FormField
                                control={form.control}
                                name="template"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Email Template
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={`<!DOCTYPE html>
<html>
<head>
    <title>Email Template</title>
</head>
<body>
    <h1>Hello!</h1>
    <p>{{previousNode.content}}</p>
    <p>Best regards,<br>Your Team</p>
</body>
</html>`}
                                                {...field}
                                                className="min-h-[200px] font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            HTML template for the email. Use {"{{previousNode.content}}"} to reference content from previous nodes.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Email Content
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Hello! This is the email content. Use {{previousNode.content}} to reference content from previous nodes."
                                                {...field}
                                                className="min-h-[120px]"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Plain text content for the email. Use {"{{previousNode.content}}"} to reference content from previous nodes.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
