import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "请输入验证码" }, { status: 400 });
    }

    // 查找对应的验证码记录
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    // 检查是否过期
    if (new Date() > record.expires) {
      return NextResponse.json({ error: "验证码已过期，请重新获取" }, { status: 400 });
    }

    // 更新用户状态为“已验证”
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // 清理无用的验证码记录
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return NextResponse.json({ message: "邮箱验证成功！" }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}