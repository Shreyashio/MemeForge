import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateMemeProject } from "@/lib/gemma";
import { MemeProjectSchema } from "@/lib/schema";

function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

function extractJson(content: string): string {
  // Strip markdown fences if present
  return content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea?.toString().trim();
    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    let rawContent: string;
    let attempts = 0;
    const maxAttempts = 3; // initial + 2 retries

    while (attempts < maxAttempts) {
      attempts++;
      try {
        rawContent = await generateMemeProject(idea);
        const jsonStr = extractJson(rawContent);
        const parsed = JSON.parse(jsonStr);
        const validated = MemeProjectSchema.parse(parsed);
        validated.logo_svg = sanitizeSvg(validated.logo_svg);

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const dataDir = path.join(process.cwd(), "data", "projects");
        await mkdir(dataDir, { recursive: true });
        const filePath = path.join(dataDir, `${id}.json`);
        await writeFile(filePath, JSON.stringify(validated, null, 2), "utf8");

        return NextResponse.json({ id });
      } catch (e) {
        if (attempts >= maxAttempts) {
          throw e;
        }
        // Retry with a clean prompt
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw new Error("Failed to generate");
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate" }, { status: 500 });
  }
}
