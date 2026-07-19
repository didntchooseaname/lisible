import { useState } from "react";
import {
  PopoverForm,
  PopoverFormButton,
  PopoverFormSeparator,
  PopoverFormSuccess,
} from "@/components/ui/popover-form";
import {
  TextureCard,
  TextureCardContent,
  TextureCardDescription,
  TextureCardFooter,
  TextureCardHeader,
  TextureCardTitle,
  TextureSeparator,
} from "@/components/ui/texture-card";

interface NewsletterIslandProps {
  title: string;
  description: string;
  emailLabel: string;
  placeholder: string;
  buttonLabel: string;
  successTitle: string;
  successMessage: string;
  note: string;
  closeLabel: string;
  idSuffix?: string;
}

type FormState = "idle" | "loading" | "success";

export function NewsletterIsland({
  title,
  description,
  emailLabel,
  placeholder,
  buttonLabel,
  successTitle,
  successMessage,
  note,
  closeLabel,
  idSuffix = "hero",
}: NewsletterIslandProps) {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const inputId = `newsletter-email-${idSuffix}`;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setFormState("idle");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formState !== "idle") return;
    setFormState("loading");
    window.setTimeout(() => setFormState("success"), 900);
  }

  return (
    <TextureCard className="w-full max-w-xl">
      <TextureCardHeader className="px-6 pt-6">
        <TextureCardTitle
          as="h2"
          className="pl-0 text-xl font-bold tracking-tight text-foreground"
        >
          {title}
        </TextureCardTitle>
        <TextureCardDescription className="mt-2 max-w-prose pl-0 text-sm leading-relaxed text-muted-foreground">
          {description}
        </TextureCardDescription>
      </TextureCardHeader>
      <TextureCardContent className="px-6 py-4">
        <PopoverForm
          title={buttonLabel}
          open={open}
          setOpen={handleOpenChange}
          showSuccess={formState === "success"}
          width="min(88vw, 364px)"
          height="200px"
          showCloseButton
          closeAriaLabel={closeLabel}
          wrapperClassName="min-h-[56px] justify-start"
          openChild={
            <form
              onSubmit={handleSubmit}
              className="flex h-full flex-col px-4 pb-3 pt-10"
            >
              <label htmlFor={inputId} className="sr-only">
                {emailLabel}
              </label>
              <input
                id={inputId}
                type="email"
                inputMode="email"
                required
                autoFocus
                placeholder={placeholder}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="relative mt-auto flex justify-end pt-3">
                <PopoverFormSeparator />
                <PopoverFormButton
                  loading={formState === "loading"}
                  text={buttonLabel}
                />
              </div>
            </form>
          }
          successChild={
            <PopoverFormSuccess
              title={successTitle}
              description={successMessage}
            />
          }
        />
      </TextureCardContent>
      <TextureSeparator />
      <TextureCardFooter className="px-6 py-3">
        <p className="text-xs text-muted-foreground">{note}</p>
      </TextureCardFooter>
    </TextureCard>
  );
}

export default NewsletterIsland;
