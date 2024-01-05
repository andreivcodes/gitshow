import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";

export const ThemeSelect = ({ selected }: { selected: string | null }) => {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        const setTheme = async () => {
          fetch("/api/theme", {
            body: JSON.stringify({
              theme: e,
            }),
            method: "POST",
          });
        };

        if (session.data?.user.subscription_type === "premium") {
          setTheme();
          toast({
            description: "Your theme has been changed",
          });
        }

        router.replace({
          query: { ...router.query, theme: e },
        });
      }}
      defaultValue={selected ? selected : undefined}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="classic">Classic</SelectItem>
          <SelectItem value="githubDark">Github Dark</SelectItem>
          <SelectItem value="dracula">Dracula</SelectItem>
          <SelectItem value="spooky">Spooky</SelectItem>
          <SelectItem value="bnw">Black and White</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
