"use client";

import { useState } from "react";
import { Plus, Eye, ExternalLink, X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AutoTag {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CustomTag {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const autoTags: AutoTag[] = [
  { id: "1-1", name: "1:1", icon: "👤", color: "bg-purple-100 text-purple-800" },
  { id: "brainstorm", name: "Brainstorm", icon: "💡", color: "bg-yellow-100 text-yellow-800" },
  { id: "education", name: "Education", icon: "🎓", color: "bg-blue-100 text-blue-800" },
  { id: "external", name: "External", icon: "🔗", color: "bg-red-100 text-red-800" },
  { id: "planning", name: "Planning", icon: "📅", color: "bg-green-100 text-green-800" },
  { id: "status-review", name: "Status / Review", icon: "✅", color: "bg-orange-100 text-orange-800" },
  { id: "team", name: "Team", icon: "👥", color: "bg-purple-100 text-purple-800" },
  { id: "upload", name: "Upload", icon: "📤", color: "bg-blue-100 text-blue-800" },
];

const emojiOptions = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
  "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
  "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
  "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
  "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
  "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐",
  "👤", "👥", "👨‍💼", "👩‍💼", "👨‍💻", "👩‍💻", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫",
  "💡", "🔗", "📅", "✅", "📤", "🎯", "🚀", "⭐", "🔥", "💎",
  "🎨", "🎭", "🎪", "🎬", "🎮", "🎲", "🎸", "🎺", "🎻",
  "🏆", "🏅", "🥇", "🥈", "🥉", "🏵️", "🎗️", "🎀", "🎁", "🎊",
  "🎉", "🎈", "🎂", "🍰", "🧁", "🍭", "🍬", "🍫", "🍩", "🍪",
];

const colorOptions = [
  { value: "bg-red-100 text-red-800", label: "Red" },
  { value: "bg-blue-100 text-blue-800", label: "Blue" },
  { value: "bg-green-100 text-green-800", label: "Green" },
  { value: "bg-yellow-100 text-yellow-800", label: "Yellow" },
  { value: "bg-purple-100 text-purple-800", label: "Purple" },
  { value: "bg-pink-100 text-pink-800", label: "Pink" },
  { value: "bg-orange-100 text-orange-800", label: "Orange" },
  { value: "bg-gray-100 text-gray-800", label: "Gray" },
];

export const TagsInterface = () => {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState("🏷️");
  const [newTagColor, setNewTagColor] = useState("bg-blue-100 text-blue-800");

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    const newTag: CustomTag = {
      id: `custom-${Date.now()}`,
      name: newTagName.trim(),
      icon: newTagIcon,
      color: newTagColor,
    };

    setCustomTags([...customTags, newTag]);
    setNewTagName("");
    setNewTagIcon("🏷️");
    setNewTagColor("bg-blue-100 text-blue-800");
    setIsAddDialogOpen(false);
    toast.success(`Tag "${newTag.name}" created successfully`);
  };

  const handleDeleteTag = (tagId: string) => {
    setCustomTags(customTags.filter(tag => tag.id !== tagId));
    toast.success("Tag deleted successfully");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tags</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage custom tags and auto-tagging to better organize and categorize your meetings.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Custom Tags Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Custom Tags</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Create and delete custom tags. Deleting tags will remove them from any meetings to which they are applied.
            </p>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add new tag
            </Button>
          </div>

          {customTags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {customTags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-lg flex-shrink-0">{tag.icon}</span>
                    <Badge variant="secondary" className={`${tag.color} truncate`}>
                      {tag.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm sm:text-base">No custom tags created yet.</p>
              <p className="text-xs sm:text-sm mt-1">Click "Add new tag" to create your first custom tag.</p>
            </div>
          )}
        </div>

        {/* Auto Tags Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Auto Tags</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Read automatically assigns these tags to your meetings based on the content and context.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {autoTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{tag.icon}</span>
                  <Badge variant="secondary" className={`${tag.color} truncate`}>
                    {tag.name}
                  </Badge>
                </div>
                <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xs">i</span>
            </div>
            <span className="text-xs sm:text-sm">Tags are automatically applied based on meeting content and participant behavior</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="flex justify-end">
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn more about tags
          </Button>
        </div>
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a custom tag to organize your meetings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tag-icon">Icon</Label>
              <div className="mt-1">
                <Select value={newTagIcon} onValueChange={setNewTagIcon}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an icon">
                      <span className="flex items-center space-x-2">
                        <span>{newTagIcon}</span>
                        <span>Select icon</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="grid grid-cols-8 gap-1 p-2">
                      {emojiOptions.map((emoji, index) => (
                        <SelectItem key={`emoji-${index}`} value={emoji} className="p-1">
                          <span className="text-lg">{emoji}</span>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tag-color">Color</Label>
              <Select value={newTagColor} onValueChange={setNewTagColor}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <Label className="text-sm text-gray-600">Preview</Label>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-lg">{newTagIcon}</span>
                <Badge variant="secondary" className={newTagColor}>
                  {newTagName || "Tag Name"}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
