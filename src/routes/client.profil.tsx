import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientBottomNav } from "@/components/ClientBottomNav";
import { DirectChatPanel } from "@/components/DirectChatPanel";
import { getClientSession } from "@/lib/client-session";
import type { ClientSession } from "@/lib/client-auth.functions";
import { useT } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/client/profil")({
  head: () => ({
    meta: [{ title: "Chat — Access Prestige Taxi" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ClientChatPage,
});

const css = `
.cc-root{min-height:100dvh;background:#030a13;color:#f5f1e8;font-family:Inter,system-ui,sans-serif;padding:0 0 82px;display:flex;flex-direction:column}
.cc-main{padding:12px;flex:1;display:flex;flex-direction:column;min-height:0}
.cc-main-inner{max-width:390px;margin:0 auto;width:100%;flex:1;display:flex;flex-direction:column;min-height:0}
.cc-shell{border-radius:24px;padding:13px;background:#030a13;box-shadow:0 0 40px rgba(214,168,61,.06);flex:1;display:flex;flex-direction:column;min-height:0}
.cc-kicker{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#e6b95a}
.cc-title{font-family:Georgia,serif;font-size:20px;margin:4px 0 0}
.cc-subtitle{margin-top:2px;font-size:11px;color:rgba(255,255,255,.5)}
.cc-panel{margin-top:14px;flex:1;min-height:360px;display:flex;flex-direction:column;overflow:hidden;border-radius:16px;background:#07101a;border:1px solid rgba(214,168,61,.45)}
@media(min-width:700px){.cc-main-inner{max-width:720px}.cc-shell{padding:20px}}
`;

function ClientChatPage() {
  const navigate = useNavigate();
  const t = useT();
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    const s = getClientSession();
    if (!s) {
      navigate({ to: "/client/login" });
      return;
    }
    setSession(s);
  }, [navigate]);

  if (!session) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cc-root">
        <main className="cc-main">
          <div className="cc-main-inner">
            <div className="cc-shell">
              <div className="cc-kicker">{t("client.eyebrow")}</div>
              <h1 className="cc-title">{t("client.chat.title")}</h1>
              <p className="cc-subtitle">{t("client.chat.subtitle")}</p>
              <div className="cc-panel">
                <DirectChatPanel
                  accountId={session.id}
                  authToken={session.token}
                  role="client"
                  peerName="Access Prestige Taxi 🚖"
                />
              </div>
            </div>
          </div>
        </main>
        <ClientBottomNav />
      </div>
    </>
  );
}
