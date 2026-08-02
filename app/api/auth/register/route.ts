import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码为必填项" }, { status: 400 });
    }

    // 1. 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 创建或更新未激活的用户
    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          password: hashedPassword,
        },
      });
    }

    // 4. 生成 6 位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效

    // 删除旧验证码并保存新验证码
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
      },
    });

    // 5. 发送验证码邮件 (Resend 测试模式可以使用 onboarded@resend.dev 发送)
    await resend.emails.send({
      from: "献血预约系统 <onboarding@resend.dev>",
      to: [email],
      subject: "【献血预约系统】邮箱验证码",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>感谢您的注册！</h2>
          <p>您的验证码为：<strong style="font-size: 24px; color: #e11d48;">${code}</strong></p>
          <p>验证码将在 10 分钟后失效，请尽快完成验证。</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "验证码已发送到您的邮箱", requireVerify: true }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "发送验证邮件失败，请检查邮箱是否输入正确" }, { status: 500 });
  }
}