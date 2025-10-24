"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Upload, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    image: z.string().optional(),
    jobTitle: z.string().optional(),
    role: z.string().optional(),
    department: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileAccountInterface = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [imageRemoved, setImageRemoved] = useState(false);

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    
    const { data: profile, isLoading } = useQuery(trpc.userSettings.getProfile.queryOptions());
    
    const updateProfile = useMutation(
        trpc.userSettings.updateProfile.mutationOptions({
            onSuccess: () => {
                toast.success("Profile updated successfully");
                setHasChanges(false);
                setImageRemoved(false);
                setProfileImage(null);
                queryClient.invalidateQueries(trpc.userSettings.getProfile.queryOptions());
            },
            onError: (error) => {
                toast.error(error.message || "Failed to update profile");
            },
        })
    );

    // Parse first and last name from the full name
    const getFirstName = () => {
        if (!profile?.name) return "";
        const nameParts = profile.name.split(" ");
        return nameParts[0] || "";
    };

    const getLastName = () => {
        if (!profile?.name) return "";
        const nameParts = profile.name.split(" ");
        return nameParts.slice(1).join(" ") || "";
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: getFirstName(),
            lastName: getLastName(),
            image: profile?.image || "",
            jobTitle: "",
            role: "",
            department: "",
        },
    });

    // Update form when profile data changes
    useEffect(() => {
        if (profile) {
            setValue("firstName", getFirstName());
            setValue("lastName", getLastName());
            setValue("image", profile.image || "");
            // Keep the additional fields as they are (not saved to DB)
        }
    }, [profile, setValue]);

    const watchedFirstName = watch("firstName");
    const watchedLastName = watch("lastName");
    const watchedImage = watch("image");

    // Check for changes (only for fields that are saved to DB)
    useEffect(() => {
        const hasFormChanges = 
            watchedFirstName !== getFirstName() ||
            watchedLastName !== getLastName() ||
            watchedImage !== (profile?.image || "") ||
            imageRemoved;
        setHasChanges(hasFormChanges);
    }, [watchedFirstName, watchedLastName, watchedImage, profile, imageRemoved]);

    const onSubmit = (data: ProfileFormData) => {
        // Only save firstName, lastName, and image to database
        updateProfile.mutate({
            firstName: data.firstName,
            lastName: data.lastName,
            image: imageRemoved ? "" : (profileImage || data.image),
        });
        // Note: jobTitle, role, and department are not saved to DB
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setProfileImage(result);
                setValue("image", result);
                setImageRemoved(false); // Reset remove flag when new image is selected
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setProfileImage(null);
        setValue("image", "");
        setImageRemoved(true); // Mark that image should be removed from DB
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile & Account</h1>
                <p className="text-gray-600 mt-2">
                    Manage your personal information, preferences, and account settings.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Account Information Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Information</h2>
                    <p className="text-gray-600 mb-6">Update your personal details and preferences.</p>

                    {/* Profile Photo */}
                    <div className="flex items-start space-x-6 mb-8">
                        <div className="relative">
                            <Avatar className="w-20 h-20">
                                {!imageRemoved && (profileImage || (profile?.image && profile.image.trim() !== "")) ? (
                                    <AvatarImage 
                                        src={profileImage || profile?.image || ""} 
                                        alt="Profile" 
                                    />
                                ) : null}
                                <AvatarFallback className="text-lg">
                                    {getFirstName().charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                                <Camera className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">Profile Photo</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                This will be displayed on your profile.
                            </p>
                            <div className="flex space-x-3">
                                <label htmlFor="image-upload">
                                    <Button type="button" variant="outline" size="sm" asChild>
                                        <span className="flex items-center">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Change
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={removeImage}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <Input
                                {...register("firstName")}
                                placeholder="Enter your first name"
                                className={errors.firstName ? "border-red-500" : ""}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <Input
                                {...register("lastName")}
                                placeholder="Enter your last name"
                                className={errors.lastName ? "border-red-500" : ""}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Job Title
                            </label>
                            <Input
                                {...register("jobTitle")}
                                placeholder="e.g: Product Designer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <Input
                                {...register("role")}
                                placeholder="e.g: Executive"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <Input
                                {...register("department")}
                                placeholder="e.g: Information Technology"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Email
                            </label>
                            <div className="relative">
                                <Input
                                    value={profile?.email || ""}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Languages
                            </label>
                            <select className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md bg-white text-sm">
                                <option>English</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Email
                            </label>
                            <Input
                                value={profile?.email || ""}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Changes will be saved automatically</p>
                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setValue("firstName", getFirstName());
                                setValue("lastName", getLastName());
                                setValue("image", profile?.image || "");
                                setValue("jobTitle", "");
                                setValue("role", "");
                                setValue("department", "");
                                setProfileImage(null);
                                setImageRemoved(false);
                                setHasChanges(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateProfile.isPending || !hasChanges}
                        >
                            {updateProfile.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
