import { redirect } from "next/navigation";

export default function Home() {
  // Directly redirect the root URL to the login page
  redirect("/login");
}
