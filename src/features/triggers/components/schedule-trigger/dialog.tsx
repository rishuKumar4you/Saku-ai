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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    time: z.number().min(1, "Time must be at least 1").max(999999, "Time must be less than 999,999"),
    unit: z.enum(["seconds", "minutes", "hours"]),
    enabled: z.boolean(),
});

export type FormType = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultTime?: number;
    defaultUnit?: string;
    defaultEnabled?: boolean;
};

export const ScheduleTriggerDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultTime = 1,
    defaultUnit = "seconds",
    defaultEnabled = true,
}: Props) => { 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            time: defaultTime,
            unit: defaultUnit as "seconds" | "minutes" | "hours",
            enabled: defaultEnabled,
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(() => {
        if (open) {
            form.reset({
                time: defaultTime,
                unit: defaultUnit as "seconds" | "minutes" | "hours",
                enabled: defaultEnabled,
            });
        }
    }, [open, defaultTime, defaultUnit, defaultEnabled, form]);
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Schedule Trigger Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure the time interval for this scheduled trigger.
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
                                            Enable Schedule Trigger
                                        </FormLabel>
                                        <FormDescription>
                                            Activate this trigger to run on the specified schedule.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Time Interval
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="999999"
                                                placeholder="1"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Allow empty string for deletion, otherwise parse to number
                                                    if (value === '') {
                                                        field.onChange(undefined);
                                                    } else {
                                                        const parsed = parseInt(value);
                                                        field.onChange(isNaN(parsed) ? undefined : parsed);
                                                    }
                                                }}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Number of time units between triggers.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Time Unit
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="seconds">Seconds</SelectItem>
                                                <SelectItem value="minutes">Minutes</SelectItem>
                                                <SelectItem value="hours">Hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Unit of time for the interval.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Schedule Preview</h4>
                            <p className="text-sm text-muted-foreground">
                                This trigger will run every{" "}
                                <span className="font-medium">
                                    {form.watch("time")} {form.watch("unit")}
                                </span>
                                {" "}when enabled.
                            </p>
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
