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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AIFunction } from "../ai-shared";

const formSchema = z.object({
    function: z.enum(["text_generation", "sentiment_analysis"] as const),
    prompt: z.string().min(1, "Prompt is required"),
    model: z.string().min(1, "Model is required"),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(1).max(8192),
});

export type FormType = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    nodeId?: string;
    defaultFunction?: AIFunction;
    defaultPrompt?: string;
    defaultModel?: string;
    defaultTemperature?: number;
    defaultMaxTokens?: number;
};

export const GeminiDialog = ({
    open,
    onOpenChange,
    onSubmit,
    nodeId,
    defaultFunction = "text_generation",
    defaultPrompt = "",
    defaultModel = "gemini-2.5-flash",
    defaultTemperature = 0.7,
    defaultMaxTokens = 1000,
}: Props) => { 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            function: defaultFunction,
            prompt: defaultPrompt,
            model: defaultModel,
            temperature: defaultTemperature,
            maxTokens: defaultMaxTokens,
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(() => {
        if (open) {
            form.reset({
                function: defaultFunction,
                prompt: defaultPrompt,
                model: defaultModel,
                temperature: defaultTemperature,
                maxTokens: defaultMaxTokens,
            });
        }
    }, [open, defaultFunction, defaultPrompt, defaultModel, defaultTemperature, defaultMaxTokens, form]);

    const watchFunction = form.watch("function");
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Gemini Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure settings for the Google Gemini AI processing node.
                    </DialogDescription>
                    {nodeId && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                            <p className="text-sm font-mono">
                                <span className="font-medium">Node ID:</span> {nodeId}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Use this ID in prompts: {`{{${nodeId}.content}}`}
                            </p>
                        </div>
                    )}
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="function"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        AI Function
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select AI function" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="text_generation">Text Generation</SelectItem>
                                            <SelectItem value="sentiment_analysis">Sentiment Analysis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose the type of AI processing to perform.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Model
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                            <SelectItem value="gemini-2.5-pro">Gemini 1.5 Pro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {/* Dev comment: Change models here as needed */}
                                        Google Gemini model to use for processing. Update available models in the code as needed.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Prompt
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={
                                                watchFunction === "sentiment_analysis" 
                                                    ? "Analyze the sentiment of the following text: {{previousNode.content}}"
                                                    : "Generate content based on: {{previousNode.content}}"
                                            }
                                            {...field}
                                            className="min-h-[120px]"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {watchFunction === "sentiment_analysis" 
                                            ? "Prompt for sentiment analysis. Use {{previousNode.content}} to reference content from previous nodes."
                                            : "Prompt for text generation. Use {{previousNode.content}} to reference content from previous nodes."
                                        }
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="temperature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Temperature
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Controls randomness (0-2). Lower = more focused.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxTokens"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Max Tokens
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="8192"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum tokens in response (1-8192).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
