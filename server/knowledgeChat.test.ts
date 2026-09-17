import { afterEach, describe, expect, it, vi } from "vitest";
import { runChat, type KnowledgeSnippet } from "./knowledgeChat";

const envKeys = [
  "GROQ_API_URL",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "MOONSHOT_API_URL",
  "MOONSHOT_API_KEY",
  "MOONSHOT_MODEL",
] as const;
const savedEnv: Record<string, string | undefined> = {};

function clearEnv() {
  for (const key of envKeys) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
}

afterEach(() => {
  for (const key of envKeys) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  vi.unstubAllGlobals();
});

const snippets: KnowledgeSnippet[] = [
  {
    kind: "room",
    id: "linuxprivesc",
    title: "Linux PrivEsc",
    extract: "TryHackMe room: tryhackme.com/room/linuxprivesc",
    meta: "level-2",
  },
  {
    kind: "playbook",
    id: "linux-privesc",
    title: "Linux PrivEsc playbook",
    extract: "SUID, sudo -l, cron jobs",
    meta: "linux",
  },
];

describe("runChat", () => {
  it("returns a local knowledge digest when Groq is not configured", async () => {
    clearEnv();
    const result = await runChat({ message: "linux privesc room санал болго", history: [], snippets });
    expect(result.chatProvider).toBe("local");
    expect(result.backgroundProvider).toBe("local");
    expect(result.reply).toContain("Linux PrivEsc");
  });

  it("returns a local no-match message when neither Groq nor snippets are available", async () => {
    clearEnv();
    const result = await runChat({ message: "sain uu", history: [], snippets: [] });
    expect(result.chatProvider).toBe("local");
    expect(result.reply).toContain("тохирох зүйл ч олдсонгүй");
  });

  it("calls Groq with a system prompt built from the snippets when configured", async () => {
    clearEnv();
    process.env.GROQ_API_URL = "https://api.groq.example/openai/v1";
    process.env.GROQ_API_KEY = "gsk-test";

    let capturedBody: any = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        capturedBody = JSON.parse(String(init.body));
        return new Response(
          JSON.stringify({ choices: [{ message: { content: '"Linux PrivEsc" room-оос эхэл.' } }] }),
          { status: 200 }
        );
      })
    );

    const result = await runChat({ message: "linux privesc yaj hiih ve", history: [], snippets });
    expect(result.chatProvider).toBe("groq");
    expect(result.reply).toContain("Linux PrivEsc");
    expect(capturedBody.messages[0].role).toBe("system");
    expect(capturedBody.messages[0].content).toContain("[KNOWLEDGE]");
    expect(capturedBody.messages.at(-1)).toEqual({ role: "user", content: "linux privesc yaj hiih ve" });
  });

  it("labels the background enrichment as gemini only when the LLM path actually ran", async () => {
    clearEnv();
    process.env.GROQ_API_URL = "https://api.groq.example/openai/v1";
    process.env.GROQ_API_KEY = "gsk-test";
    process.env.MOONSHOT_API_URL = "https://api.moonshot.example/v1";
    process.env.MOONSHOT_API_KEY = "sk-test";

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("moonshot")) {
          return new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      summary: "Linux privilege escalation overview",
                      concepts: ["SUID", "sudo"],
                      steps: ["Enumerate SUID binaries", "Check sudo -l"],
                    }),
                  },
                },
              ],
            }),
            { status: 200 }
          );
        }
        return new Response(JSON.stringify({ choices: [{ message: { content: "Эхлэх санал." } }] }), {
          status: 200,
        });
      })
    );

    const result = await runChat({ message: "linux privesc", history: [], snippets });
    expect(result.backgroundProvider).toBe("gemini");
    expect(result.chatProvider).toBe("groq");
  });

  it("falls back to the local digest and adds a note when the Groq call fails", async () => {
    clearEnv();
    process.env.GROQ_API_URL = "https://api.groq.example/openai/v1";
    process.env.GROQ_API_KEY = "gsk-test";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 }))
    );

    const result = await runChat({ message: "linux privesc", history: [], snippets });
    expect(result.chatProvider).toBe("local");
    expect(result.note).toContain("Groq дуудлага амжилтгүй");
    expect(result.reply).toContain("Linux PrivEsc");
  });
});
