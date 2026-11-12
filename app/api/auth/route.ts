import { NextResponse } from "next/server";

const VALID_ACCOUNTS = [
  {
    email: "curator@designersale.com.au",
    password: "curator123",
    name: "Elena Roche",
    role: "Chief Design Curator",
  },
  {
    email: "demo@designersale.com.au",
    password: "demo123",
    name: "Guest Curator",
    role: "Editorial Reviewer",
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, isDemo } = body;

    if (isDemo) {
      const demoUser = VALID_ACCOUNTS[0];
      const response = NextResponse.json({
        success: true,
        user: {
          id: "curator-demo",
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        },
        token: `ds_session_token_${Date.now()}`,
        message: "Instant Demo Curator session initialized successfully.",
      });

      response.cookies.set("ds_curator_session", "authenticated_curator", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });

      return response;
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required fields." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const found = VALID_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === password
    );

    if (!found) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid curator credentials. Please verify your email and password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: `curator-${normalizedEmail.split("@")[0]}`,
        email: found.email,
        name: found.name,
        role: found.role,
      },
      token: `ds_session_token_${Date.now()}`,
      message: "Curator authenticated successfully.",
    });

    response.cookies.set("ds_curator_session", "authenticated_curator", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "An unexpected authentication error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Curator session terminated successfully.",
  });

  response.cookies.set("ds_curator_session", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  return NextResponse.json({
    active: true,
    supportedRoles: ["Chief Design Curator", "Editorial Reviewer", "Proprietor Submitter"],
    demoCredentials: {
      email: "curator@designersale.com.au",
      password: "curator123",
      role: "Chief Design Curator",
    },
  });
}
