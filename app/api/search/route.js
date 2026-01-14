import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiUrl = searchParams.get("apiUrl");
    console.log("apiUrl", decodeURIComponent(apiUrl));
    if (!apiUrl) {
      return NextResponse.json({ error: "缺少 apiUrl 参数" }, { status: 400 });
    }

    const response = await fetch(decodeURIComponent(apiUrl), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API 请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("搜索 API 代理错误:", error);
    return NextResponse.json(
      { error: error.message || "服务器错误" },
      { status: 500 }
    );
  }
}
