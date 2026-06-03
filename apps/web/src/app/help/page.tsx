import { redirect } from "next/navigation";

export const metadata = {
  title: "Help Center",
  description: "Find guides, troubleshooting steps, and feature documentation.",
};

export default function HelpPage() {
  redirect("/help/category/getting-started");
}
