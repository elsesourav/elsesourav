"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import { useState, useRef } from "react";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { ImageConfigGrid } from "@/components/admin/ImageConfigGrid";

export function AdminAboutClient({ initialData }: { initialData: any }) {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  
  const [summary, setSummary] = useState(initialData.summary);
  const [body, setBody] = useState(initialData.body);
  const [socialLinks, setSocialLinks] = useState<any[]>(initialData.socialLinks || []);

  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      { id: "", platform: "NEW", url: "", iconUrl: "", isActive: true },
    ]);
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
  };

  const updateSocialLink = (index: number, key: string, value: string | boolean) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [key]: value };
    setSocialLinks(newLinks);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          body,
          socialLinks,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save");
      
      dispatch(enqueueNotification({ tone: "success", message: "About settings updated successfully!" }));
    } catch (error) {
      dispatch(enqueueNotification({ tone: "error", message: error instanceof Error ? error.message : "Save failed" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 max-w-6xl pb-24">
      {/* 1. IMAGES (Using the specialized Grid Component) */}
      <Card>
        <CardContent className="p-6 space-y-8">
          <ImageConfigGrid 
            title="Profile Images"
            description="These images appear in the interactive canvas on the About page."
            section="ABOUT_PROFILE"
            initialConfigs={initialData.aboutProfileConfigs || []}
          />
          <hr />
          <ImageConfigGrid 
            title="Name Logo Images"
            description="These images replace the 'Sourav Barui' text at the top of the About page."
            section="ABOUT_NAME_LOGO"
            initialConfigs={initialData.aboutNameLogoConfigs || []}
          />
        </CardContent>
      </Card>

      {/* 2. SUMMARY & BODY */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Short Description</h2>
            <p className="text-sm text-text-muted">Appears below the About title.</p>
            <Textarea 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[150px] font-mono"
              placeholder="Write a short summary here..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Main Body Content</h2>
            <p className="text-sm text-text-muted">The primary markdown article at the bottom.</p>
            <Textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[400px] font-mono"
              placeholder="Write the full Markdown body here..."
            />
          </CardContent>
        </Card>
      </div>

      {/* 3. SOCIAL LINKS */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Social Media Links</h2>
            <Button variant="outline" size="sm" onClick={addSocialLink}>
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          </div>
          
          <div className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border rounded-xl bg-surface-base">
                <div className="pt-2 text-gray-400 cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Platform Name</Label>
                    <Input value={link.platform} onChange={(e) => updateSocialLink(i, "platform", e.target.value)} placeholder="e.g. GitHub" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target URL</Label>
                    <Input value={link.url} onChange={(e) => updateSocialLink(i, "url", e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">Icon Image URL</Label>
                    <div className="flex gap-2">
                      <Input value={link.iconUrl || ""} onChange={(e) => updateSocialLink(i, "iconUrl", e.target.value)} placeholder="https://..." />
                      <CloudinaryUploadButton onUpload={(url) => updateSocialLink(i, "iconUrl", url)} />
                    </div>
                  </div>
                </div>

                {link.iconUrl && (
                  <div className="w-12 h-12 shrink-0 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                    <img src={link.iconUrl} alt="Icon" className="w-8 h-8 object-contain" />
                  </div>
                )}

                <Button variant="ghost" size="icon" className="text-red-500 shrink-0" onClick={() => removeSocialLink(i)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {socialLinks.length === 0 && (
              <div className="text-center p-8 text-text-muted border border-dashed rounded-xl">
                No social links added yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background/80 backdrop-blur border-t z-10 flex justify-end px-6">
        <Button onClick={handleSave} disabled={saving} loading={saving} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function CloudinaryUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/upload/cloudinary/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder: "content/images" }),
      });

      const signaturePayload = await signatureResponse.json();
      if (!signatureResponse.ok || !signaturePayload.ok) throw new Error("Failed to get signature");

      const signData = signaturePayload.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadResult.error?.message || "Upload failed");

      onUpload(uploadResult.secure_url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading} loading={uploading}>
        Upload
      </Button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </>
  );
}
