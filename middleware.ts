import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Configuração do servidor inválida' },
      { status: 500 }
    );
  }

  // Cliente Supabase para middleware
  // Nota: Para SSR completo, instale @supabase/ssr e use createServerClient
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Proteção de rotas administrativas
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendedorRoute = pathname.startsWith('/vendedor');

  if (isAdminRoute || isVendedorRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar role do usuário
    const { data: profile } = await supabase
      .from('users_profile')
      .select('role')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!profile) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAdminRoute && profile.role !== 'admin') {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'Acesso negado');
      return NextResponse.redirect(redirectUrl);
    }

    if (isVendedorRoute && profile.role !== 'vendedor' && profile.role !== 'admin') {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'Acesso negado');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Adicionar headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

