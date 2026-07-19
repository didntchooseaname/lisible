import { Search } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

interface SearchButtonProps {
  label: string;
}

export function SearchButton({ label }: SearchButtonProps) {
  return (
    <TextureButton
      variant="icon"
      size="icon"
      aria-label={label}
      className="h-11 w-11"
      {...{ "data-search-open": "" }}
    >
      <Search size={20} aria-hidden="true" className="text-foreground" />
    </TextureButton>
  );
}

export default SearchButton;
