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

  // Proteção de rotas administrativas
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendedorRoute = pathname.startsWith('/vendedor');

  // Se não há variáveis configuradas, apenas permite passar (evita erro 500)
  if (!supabaseUrl || !supabaseAnonKey) {
    // Permite acesso apenas à rota de login se não houver configuração
    if (isAdminRoute || isVendedorRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'Configuração do servidor necessária');
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Cliente Supabase para middleware
  // Nota: Para SSR completo, instale @supabase/ssr e use createServerClient
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (isAdminRoute || isVendedorRoute) {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // Se houver erro na sessão, redireciona para login
      if (sessionError || !session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Verificar role do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      // Se houver erro ou não encontrar perfil, redireciona para login
      if (profileError || !profile) {
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
    } catch (error) {
      // Em caso de erro, permite acesso mas redireciona rotas protegidas para login
      if (isAdminRoute || isVendedorRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('error', 'Erro ao verificar autenticação');
        return NextResponse.redirect(redirectUrl);
      }
      // Para outras rotas, permite passar
      return response;
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
};

