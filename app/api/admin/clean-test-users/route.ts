import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const testEmail = "jiayiaw456@gmail.com";

    // 1. 先清空验证码表
    await prisma.verificationToken.deleteMany({});

    // 2. 找到要删除的测试用户 ID
    const targetUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: "gmail.com", // 或直接用 email: testEmail
        },
      },
      select: { id: true },
    });

    const userIds = targetUsers.map((u) => u.id);

    if (userIds.length > 0) {
      // 3. 先删除该用户关联的预约记录 / 账号关联，防止外键报错
      await prisma.registration.deleteMany({
        where: { userId: { in: userIds } },
      });

      await prisma.account.deleteMany({
        where: { userId: { in: userIds } },
      });

      await prisma.session.deleteMany({
        where: { userId: { in: userIds } },
      });

      // 4. 最后删除用户本身
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }

    return NextResponse.json({
      message: "🎉 测试数据与相关关联已成功清空，可以重新测试注册了！",
    });
  } catch (err: any) {
    console.error("清理测试数据失败:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}