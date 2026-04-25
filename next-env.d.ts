"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
};

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: ""
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      company: String(formData.get("company") || ""),
      scope: String(formData.get("scope") || "")
    };

    setFormState({ status: "submitting", message: "Submitting…" });

    try {
      const response = await fetch("/api/pfas-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Submission failed.");
      }

      form.reset();
      setFormState({
        status: "success",
        message:
          result.message || "Thanks. We will review this and come back to you."
      });
    } catch (error) {
      setFormState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please email pfas@axiomordo.com."
      });
    }
  }

  return (
    <section className="section section-black" id="contact">
      <div className="container narrow">
        <div className="section-heading left">
          <p className="eyebrow">Request review</p>
          <h2>Request PFAS Review</h2>
          <p>
            Tell us what you need to understand, assess, or defend. We will
            follow up to scope the review.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <Label>
            Your name<span>*</span>
            <Input name="name" type="text" required placeholder="Enter your name" />
          </Label>

          <Label>
            Email<span>*</span>
            <Input name="email" type="email" required placeholder="Enter your email" />
          </Label>

          <Label>
            Company
            <Input name="company" type="text" placeholder="Enter your company name" />
          </Label>

          <Label>
            What do you need to understand or defend?<span>*</span>
            <Textarea
              name="scope"
              rows={6}
              required
              placeholder={
                "e.g. Customer asked about PFAS in coatings\n" +
                "e.g. No supplier evidence for several products\n" +
                "e.g. Need a defensible position before internal approval"
              }
            />
          </Label>

          <Button
            type="submit"
            disabled={formState.status === "submitting"}
          >
            {formState.status === "submitting"
              ? "Submitting…"
              : "Request PFAS Review"}
          </Button>

          {formState.status !== "idle" ? (
            <p
              className={
                formState.status === "error" ? "form-message error" : "form-message success"
              }
            >
              {formState.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
