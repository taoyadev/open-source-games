import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Game | OpenGames",
  description:
    "Submit an open source game repository to be considered for inclusion in the OpenGames directory.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return <SubmitForm />;
}
