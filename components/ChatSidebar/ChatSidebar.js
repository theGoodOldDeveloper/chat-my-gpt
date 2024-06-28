import Link from "next/link";

export default function ChatSidebar() {
  return (
    <div className="bg-slate-700">
      <Link className="btnLogout" href="/api/auth/logout">
        Logout
      </Link>
    </div>
  );
}
