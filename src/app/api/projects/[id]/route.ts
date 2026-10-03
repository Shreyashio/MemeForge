import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const filePath = path.join(process.cwd(), "data", "projects", `${id}.json`);
    const content = await readFile(filePath, "utf8");
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const filePath = path.join(process.cwd(), "data", "projects", `${id}.json`);
    const content = await readFile(filePath, "utf8");
    const data = JSON.parse(content);
    const updated = { ...data, ...body };
    await writeFile(filePath, JSON.stringify(updated, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
